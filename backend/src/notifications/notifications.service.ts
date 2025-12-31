import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, NotificationPriority } from './schemas/notification.schema';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { User, UserDocument } from '../users/schemas/user.schema';

interface CreateNotificationDto {
    recipient_id: string;
    sender_id?: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    data?: any;
}

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private wsGateway: WebSocketGatewayService,
    ) { }

    // ==================== CREAR Y ENVIAR NOTIFICACIONES ====================

    async create(dto: CreateNotificationDto): Promise<Notification> {
        const notification = new this.notificationModel({
            recipient_id: new Types.ObjectId(dto.recipient_id),
            sender_id: dto.sender_id ? new Types.ObjectId(dto.sender_id) : undefined,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            priority: dto.priority || 'medium',
            data: dto.data,
            created_at: new Date(),
        });

        const saved = await notification.save();

        // Enviar por WebSocket en tiempo real
        this.wsGateway.sendNotification(dto.recipient_id, {
            _id: saved._id.toString(),
            type: dto.type,
            title: dto.title,
            message: dto.message,
            priority: dto.priority || 'medium',
            data: dto.data,
            created_at: saved.created_at,
        });

        return saved;
    }

    async notifyRole(role: string, dto: Omit<CreateNotificationDto, 'recipient_id'>): Promise<void> {
        const users = await this.userModel.find({ rol: role, estado: 'activo' });

        for (const user of users) {
            await this.create({
                ...dto,
                recipient_id: user._id.toString(),
            });
        }
    }

    // ==================== NOTIFICACIONES DE ÓRDENES ====================

    async notifyOrderCreated(order: any, analistaId: string): Promise<void> {
        // Notificar a todos los analistas
        await this.notifyRole('analista', {
            sender_id: analistaId,
            type: 'order_created',
            title: '📋 Nueva orden creada',
            message: `Orden ${order.codigo} creada para ${order.cliente}`,
            priority: 'medium',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }

    async notifyOrderAssigned(order: any, technicianId: string, analistaId: string): Promise<void> {
        // Notificar al técnico asignado
        await this.create({
            recipient_id: technicianId,
            sender_id: analistaId,
            type: 'order_assigned',
            title: '🔧 Nueva orden asignada',
            message: `Te han asignado la orden ${order.codigo} - ${order.tipo_trabajo} en ${order.direccion}`,
            priority: 'high',
            data: { order_id: order._id, order_codigo: order.codigo, tipo_trabajo: order.tipo_trabajo },
        });

        // Notificar a analistas
        await this.notifyRole('analista', {
            sender_id: analistaId,
            type: 'order_assigned',
            title: '👤 Orden asignada',
            message: `Orden ${order.codigo} asignada a técnico`,
            priority: 'low',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }

    async notifyOrderStarted(order: any, technicianId: string): Promise<void> {
        const analistaId = typeof order.analista_id === 'object' ? order.analista_id._id : order.analista_id;

        // Notificar al analista que creó la orden
        await this.create({
            recipient_id: analistaId.toString(),
            sender_id: technicianId,
            type: 'order_started',
            title: '▶️ Orden iniciada',
            message: `El técnico ha iniciado la orden ${order.codigo}`,
            priority: 'medium',
            data: { order_id: order._id, order_codigo: order.codigo },
        });

        // Notificar a todos los analistas
        await this.notifyRole('analista', {
            sender_id: technicianId,
            type: 'order_started',
            title: '▶️ Orden en proceso',
            message: `Orden ${order.codigo} iniciada`,
            priority: 'low',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }

    async notifyOrderProgress(order: any, fase: string, technicianId: string): Promise<void> {
        const analistaId = typeof order.analista_id === 'object' ? order.analista_id._id : order.analista_id;

        const faseNames: Record<string, string> = {
            inicial: 'Foto inicial',
            durante: 'Foto durante trabajo',
            materiales: 'Foto de materiales',
            final: 'Foto final',
        };

        await this.create({
            recipient_id: analistaId.toString(),
            sender_id: technicianId,
            type: 'order_progress',
            title: '📸 Progreso de orden',
            message: `${faseNames[fase] || fase} registrada en orden ${order.codigo}`,
            priority: 'low',
            data: { order_id: order._id, order_codigo: order.codigo, fase },
        });
    }

    async notifyOrderCompleted(order: any, technicianId: string): Promise<void> {
        const analistaId = typeof order.analista_id === 'object' ? order.analista_id._id : order.analista_id;

        // Notificar al analista
        await this.create({
            recipient_id: analistaId.toString(),
            sender_id: technicianId,
            type: 'order_completed',
            title: '✅ Orden finalizada',
            message: `La orden ${order.codigo} ha sido completada exitosamente`,
            priority: 'high',
            data: { order_id: order._id, order_codigo: order.codigo },
        });

        // Notificar a analistas de inventario para revisión de materiales
        await this.notifyRole('analista_inventario_oculto', {
            sender_id: technicianId,
            type: 'order_completed',
            title: '📦 Orden completada - Revisar materiales',
            message: `Orden ${order.codigo} finalizada. Verificar consumo de materiales.`,
            priority: 'medium',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }

    async notifyOrderImpossibility(order: any, technicianId: string, motivo: string): Promise<void> {
        const analistaId = typeof order.analista_id === 'object' ? order.analista_id._id : order.analista_id;

        await this.create({
            recipient_id: analistaId.toString(),
            sender_id: technicianId,
            type: 'order_impossibility',
            title: '⚠️ Imposibilidad reportada',
            message: `Orden ${order.codigo}: ${motivo}`,
            priority: 'urgent',
            data: { order_id: order._id, order_codigo: order.codigo, motivo },
        });

        // Notificar a todos los analistas
        await this.notifyRole('analista', {
            sender_id: technicianId,
            type: 'order_impossibility',
            title: '⚠️ Imposibilidad en orden',
            message: `Orden ${order.codigo} reportada con imposibilidad`,
            priority: 'high',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }

    // ==================== NOTIFICACIONES DE MATERIALES ====================

    async notifyMaterialsAssigned(technicianId: string, materials: any[], assignedBy: string): Promise<void> {
        const totalItems = materials.reduce((sum, m) => sum + m.cantidad, 0);

        await this.create({
            recipient_id: technicianId,
            sender_id: assignedBy,
            type: 'materials_assigned',
            title: '📦 Materiales asignados',
            message: `Se te han asignado ${materials.length} tipos de materiales (${totalItems} unidades)`,
            priority: 'high',
            data: { materials, total_items: totalItems },
        });
    }

    async notifyMaterialsConsumed(technicianId: string, materials: any[], orderId: string, orderCodigo: string): Promise<void> {
        // Notificar a analistas de inventario
        await this.notifyRole('analista_inventario_oculto', {
            sender_id: technicianId,
            type: 'materials_consumed',
            title: '📉 Materiales consumidos',
            message: `Técnico consumió materiales en orden ${orderCodigo}`,
            priority: 'medium',
            data: { order_id: orderId, order_codigo: orderCodigo, materials },
        });
    }

    async notifyMaterialsReturned(technicianId: string, materials: any[], controlId: string): Promise<void> {
        await this.notifyRole('analista_inventario_oculto', {
            sender_id: technicianId,
            type: 'materials_returned',
            title: '↩️ Materiales devueltos',
            message: `Técnico ha devuelto materiales`,
            priority: 'medium',
            data: { material_control_id: controlId, materials },
        });
    }

    async notifyLowStock(technicianId: string, material: any): Promise<void> {
        await this.create({
            recipient_id: technicianId,
            type: 'materials_low_stock',
            title: '⚠️ Stock bajo',
            message: `Tu inventario de ${material.nombre} está bajo (${material.cantidad_actual} ${material.unidad_medida})`,
            priority: 'high',
            data: { material },
        });

        // También notificar a analistas de inventario
        await this.notifyRole('analista_inventario_oculto', {
            type: 'materials_low_stock',
            title: '⚠️ Stock bajo de técnico',
            message: `Técnico tiene stock bajo de ${material.nombre}`,
            priority: 'medium',
            data: { tecnico_id: technicianId, material },
        });
    }

    async notifyDiscrepancy(controlId: string, technicianId: string, discrepancyData: any): Promise<void> {
        // Notificar a analistas de inventario (urgente)
        await this.notifyRole('analista_inventario_oculto', {
            type: 'materials_discrepancy',
            title: '🚨 Descuadre detectado',
            message: `Descuadre de ${discrepancyData.valor} unidades en control de materiales`,
            priority: 'urgent',
            data: { material_control_id: controlId, tecnico_id: technicianId, ...discrepancyData },
        });

        // Notificar al técnico
        await this.create({
            recipient_id: technicianId,
            type: 'materials_discrepancy',
            title: '⚠️ Descuadre en materiales',
            message: `Se detectó un descuadre en tu control de materiales. Un analista lo revisará.`,
            priority: 'high',
            data: { material_control_id: controlId },
        });
    }

    // ==================== MENSAJES DIRECTOS ====================

    async sendDirectMessage(senderId: string, recipientId: string, message: string): Promise<Notification> {
        const sender = await this.userModel.findById(senderId);

        return this.create({
            recipient_id: recipientId,
            sender_id: senderId,
            type: 'direct_message',
            title: `💬 Mensaje de ${sender?.nombre || 'Usuario'}`,
            message,
            priority: 'medium',
        });
    }

    // ==================== CONSULTAS ====================

    async findByUser(userId: string, query: any = {}): Promise<{ data: Notification[]; total: number; unread: number }> {
        const { page = 1, limit = 20, unreadOnly = false } = query;
        const skip = (page - 1) * limit;

        const filters: any = { recipient_id: new Types.ObjectId(userId) };
        if (unreadOnly === 'true' || unreadOnly === true) {
            filters.read = false;
        }

        const [data, total, unread] = await Promise.all([
            this.notificationModel
                .find(filters)
                .populate('sender_id', 'nombre email rol')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.notificationModel.countDocuments(filters),
            this.notificationModel.countDocuments({ recipient_id: new Types.ObjectId(userId), read: false }),
        ]);

        return { data, total, unread };
    }

    async markAsRead(notificationId: string, userId: string): Promise<Notification> {
        const notification = await this.notificationModel.findOneAndUpdate(
            { _id: notificationId, recipient_id: new Types.ObjectId(userId) },
            { read: true, read_at: new Date() },
            { new: true }
        );

        return notification;
    }

    async markAllAsRead(userId: string): Promise<{ modified: number }> {
        const result = await this.notificationModel.updateMany(
            { recipient_id: new Types.ObjectId(userId), read: false },
            { read: true, read_at: new Date() }
        );

        return { modified: result.modifiedCount };
    }

    async deleteOld(daysOld: number = 30): Promise<{ deleted: number }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await this.notificationModel.deleteMany({
            created_at: { $lt: cutoffDate },
            read: true,
        });

        return { deleted: result.deletedCount };
    }
}
