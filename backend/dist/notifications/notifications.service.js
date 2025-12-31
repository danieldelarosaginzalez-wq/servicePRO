"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const user_schema_1 = require("../users/schemas/user.schema");
let NotificationsService = class NotificationsService {
    constructor(notificationModel, userModel, wsGateway) {
        this.notificationModel = notificationModel;
        this.userModel = userModel;
        this.wsGateway = wsGateway;
    }
    async create(dto) {
        const notification = new this.notificationModel({
            recipient_id: new mongoose_2.Types.ObjectId(dto.recipient_id),
            sender_id: dto.sender_id ? new mongoose_2.Types.ObjectId(dto.sender_id) : undefined,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            priority: dto.priority || 'medium',
            data: dto.data,
            created_at: new Date(),
        });
        const saved = await notification.save();
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
    async notifyRole(role, dto) {
        const users = await this.userModel.find({ rol: role, estado: 'activo' });
        for (const user of users) {
            await this.create({
                ...dto,
                recipient_id: user._id.toString(),
            });
        }
    }
    async notifyOrderCreated(order, analistaId) {
        await this.notifyRole('analista', {
            sender_id: analistaId,
            type: 'order_created',
            title: '📋 Nueva orden creada',
            message: `Orden ${order.codigo} creada para ${order.cliente}`,
            priority: 'medium',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }
    async notifyOrderAssigned(order, technicianId, analistaId) {
        await this.create({
            recipient_id: technicianId,
            sender_id: analistaId,
            type: 'order_assigned',
            title: '🔧 Nueva orden asignada',
            message: `Te han asignado la orden ${order.codigo} - ${order.tipo_trabajo} en ${order.direccion}`,
            priority: 'high',
            data: { order_id: order._id, order_codigo: order.codigo, tipo_trabajo: order.tipo_trabajo },
        });
        await this.notifyRole('analista', {
            sender_id: analistaId,
            type: 'order_assigned',
            title: '👤 Orden asignada',
            message: `Orden ${order.codigo} asignada a técnico`,
            priority: 'low',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }
    async notifyOrderStarted(order, technicianId) {
        const analistaId = typeof order.analista_id === 'object' ? order.analista_id._id : order.analista_id;
        await this.create({
            recipient_id: analistaId.toString(),
            sender_id: technicianId,
            type: 'order_started',
            title: '▶️ Orden iniciada',
            message: `El técnico ha iniciado la orden ${order.codigo}`,
            priority: 'medium',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
        await this.notifyRole('analista', {
            sender_id: technicianId,
            type: 'order_started',
            title: '▶️ Orden en proceso',
            message: `Orden ${order.codigo} iniciada`,
            priority: 'low',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }
    async notifyOrderProgress(order, fase, technicianId) {
        const analistaId = typeof order.analista_id === 'object' ? order.analista_id._id : order.analista_id;
        const faseNames = {
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
    async notifyOrderCompleted(order, technicianId) {
        const analistaId = typeof order.analista_id === 'object' ? order.analista_id._id : order.analista_id;
        await this.create({
            recipient_id: analistaId.toString(),
            sender_id: technicianId,
            type: 'order_completed',
            title: '✅ Orden finalizada',
            message: `La orden ${order.codigo} ha sido completada exitosamente`,
            priority: 'high',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
        await this.notifyRole('analista_inventario_oculto', {
            sender_id: technicianId,
            type: 'order_completed',
            title: '📦 Orden completada - Revisar materiales',
            message: `Orden ${order.codigo} finalizada. Verificar consumo de materiales.`,
            priority: 'medium',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }
    async notifyOrderImpossibility(order, technicianId, motivo) {
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
        await this.notifyRole('analista', {
            sender_id: technicianId,
            type: 'order_impossibility',
            title: '⚠️ Imposibilidad en orden',
            message: `Orden ${order.codigo} reportada con imposibilidad`,
            priority: 'high',
            data: { order_id: order._id, order_codigo: order.codigo },
        });
    }
    async notifyMaterialsAssigned(technicianId, materials, assignedBy) {
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
    async notifyMaterialsConsumed(technicianId, materials, orderId, orderCodigo) {
        await this.notifyRole('analista_inventario_oculto', {
            sender_id: technicianId,
            type: 'materials_consumed',
            title: '📉 Materiales consumidos',
            message: `Técnico consumió materiales en orden ${orderCodigo}`,
            priority: 'medium',
            data: { order_id: orderId, order_codigo: orderCodigo, materials },
        });
    }
    async notifyMaterialsReturned(technicianId, materials, controlId) {
        await this.notifyRole('analista_inventario_oculto', {
            sender_id: technicianId,
            type: 'materials_returned',
            title: '↩️ Materiales devueltos',
            message: `Técnico ha devuelto materiales`,
            priority: 'medium',
            data: { material_control_id: controlId, materials },
        });
    }
    async notifyLowStock(technicianId, material) {
        await this.create({
            recipient_id: technicianId,
            type: 'materials_low_stock',
            title: '⚠️ Stock bajo',
            message: `Tu inventario de ${material.nombre} está bajo (${material.cantidad_actual} ${material.unidad_medida})`,
            priority: 'high',
            data: { material },
        });
        await this.notifyRole('analista_inventario_oculto', {
            type: 'materials_low_stock',
            title: '⚠️ Stock bajo de técnico',
            message: `Técnico tiene stock bajo de ${material.nombre}`,
            priority: 'medium',
            data: { tecnico_id: technicianId, material },
        });
    }
    async notifyDiscrepancy(controlId, technicianId, discrepancyData) {
        await this.notifyRole('analista_inventario_oculto', {
            type: 'materials_discrepancy',
            title: '🚨 Descuadre detectado',
            message: `Descuadre de ${discrepancyData.valor} unidades en control de materiales`,
            priority: 'urgent',
            data: { material_control_id: controlId, tecnico_id: technicianId, ...discrepancyData },
        });
        await this.create({
            recipient_id: technicianId,
            type: 'materials_discrepancy',
            title: '⚠️ Descuadre en materiales',
            message: `Se detectó un descuadre en tu control de materiales. Un analista lo revisará.`,
            priority: 'high',
            data: { material_control_id: controlId },
        });
    }
    async sendDirectMessage(senderId, recipientId, message) {
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
    async findByUser(userId, query = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = query;
        const skip = (page - 1) * limit;
        const filters = { recipient_id: new mongoose_2.Types.ObjectId(userId) };
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
            this.notificationModel.countDocuments({ recipient_id: new mongoose_2.Types.ObjectId(userId), read: false }),
        ]);
        return { data, total, unread };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationModel.findOneAndUpdate({ _id: notificationId, recipient_id: new mongoose_2.Types.ObjectId(userId) }, { read: true, read_at: new Date() }, { new: true });
        return notification;
    }
    async markAllAsRead(userId) {
        const result = await this.notificationModel.updateMany({ recipient_id: new mongoose_2.Types.ObjectId(userId), read: false }, { read: true, read_at: new Date() });
        return { modified: result.modifiedCount };
    }
    async deleteOld(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await this.notificationModel.deleteMany({
            created_at: { $lt: cutoffDate },
            read: true,
        });
        return { deleted: result.deletedCount };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        websocket_gateway_1.WebSocketGatewayService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map