import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ConnectedUser {
    odId: string;
    oderId: string;
    rol: string;
    nombre: string;
    socketId: string;
    connectedAt: Date;
}

@WebSocketGateway({
    cors: {
        origin: true, // En producción, especificar dominios
        credentials: true,
    },
})
export class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers: Map<string, ConnectedUser> = new Map();

    handleConnection(client: Socket) {
        console.log(`🔌 Cliente conectado: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const user = this.connectedUsers.get(client.id);
        if (user) {
            console.log(`🔌 Usuario desconectado: ${user.nombre} (${user.rol})`);
            // Notificar a analistas que un técnico se desconectó
            if (user.rol === 'tecnico') {
                this.server.to('rol-analista').emit('technician-offline', {
                    userId: user.oderId,
                    nombre: user.nombre,
                });
            }
        }
        this.connectedUsers.delete(client.id);
        this.broadcastOnlineUsers();
    }

    @SubscribeMessage('register')
    handleRegister(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId: string; rol: string; nombre: string }
    ) {
        this.connectedUsers.set(client.id, {
            odId: data.userId,
            oderId: data.userId,
            rol: data.rol,
            nombre: data.nombre,
            socketId: client.id,
            connectedAt: new Date(),
        });

        // Unir a salas según rol
        client.join(`rol-${data.rol}`);
        client.join(`user-${data.userId}`);

        console.log(`👤 Usuario registrado: ${data.nombre} (${data.rol})`);

        // Notificar a analistas que un técnico se conectó
        if (data.rol === 'tecnico') {
            this.server.to('rol-analista').emit('technician-online', {
                userId: data.userId,
                nombre: data.nombre,
            });
        }

        this.broadcastOnlineUsers();

        return { success: true, message: 'Registrado correctamente' };
    }

    @SubscribeMessage('join-order')
    handleJoinOrder(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { orderId: string }
    ) {
        client.join(`order-${data.orderId}`);
        return { success: true };
    }

    @SubscribeMessage('leave-order')
    handleLeaveOrder(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { orderId: string }
    ) {
        client.leave(`order-${data.orderId}`);
        return { success: true };
    }

    // ==================== NOTIFICACIONES EN TIEMPO REAL ====================

    sendNotification(userId: string, notification: any) {
        this.server.to(`user-${userId}`).emit('notification', notification);
        console.log(`📢 Notificación enviada a ${userId}: ${notification.title}`);
    }

    sendNotificationToRole(rol: string, notification: any) {
        this.server.to(`rol-${rol}`).emit('notification', notification);
        console.log(`📢 Notificación enviada a rol ${rol}: ${notification.title}`);
    }

    // ==================== EVENTOS DE ÓRDENES ====================

    notifyOrderCreated(order: any) {
        this.server.to('rol-analista').emit('order-created', order);
        console.log('📢 Nueva orden creada:', order.codigo);
    }

    notifyOrderAssigned(order: any, technicianId: string) {
        // Al técnico específico
        this.server.to(`user-${technicianId}`).emit('order-assigned', order);
        // A todos los analistas
        this.server.to('rol-analista').emit('order-updated', order);
        console.log(`📢 Orden ${order.codigo} asignada a técnico ${technicianId}`);
    }

    notifyOrderStatusChanged(order: any) {
        // A la sala de la orden
        this.server.to(`order-${order._id}`).emit('order-status-changed', order);
        // A analistas
        this.server.to('rol-analista').emit('order-updated', order);

        // Al técnico asignado
        if (order.tecnico_id) {
            const techId = typeof order.tecnico_id === 'object' ? order.tecnico_id._id : order.tecnico_id;
            this.server.to(`user-${techId}`).emit('order-updated', order);
        }
        console.log(`📢 Estado de orden ${order.codigo} cambiado a ${order.estado}`);
    }

    notifyOrderProgress(order: any, fase: string) {
        this.server.to(`order-${order._id}`).emit('order-progress', { order, fase });
        this.server.to('rol-analista').emit('order-progress', { order, fase });
        console.log(`📢 Progreso de orden ${order.codigo} - fase ${fase}`);
    }

    notifyOrderCompleted(order: any) {
        this.server.to('rol-analista').emit('order-completed', order);
        this.server.to('rol-analista_inventario_oculto').emit('order-completed', order);
        console.log(`📢 Orden ${order.codigo} completada`);
    }

    notifyOrderImpossibility(order: any) {
        this.server.to('rol-analista').emit('order-impossibility', order);
        console.log(`📢 Imposibilidad en orden ${order.codigo}`);
    }

    // ==================== EVENTOS DE INVENTARIO ====================

    notifyInventoryUpdated(technicianId: string, data: any) {
        this.server.to(`user-${technicianId}`).emit('inventory-updated', data);
        this.server.to('rol-analista_inventario_oculto').emit('inventory-updated', { technicianId, ...data });
        console.log(`📢 Inventario actualizado para técnico ${technicianId}`);
    }

    notifyMaterialAssigned(technicianId: string, materials: any[]) {
        this.server.to(`user-${technicianId}`).emit('materials-assigned', materials);
        console.log(`📢 Materiales asignados a técnico ${technicianId}`);
    }

    notifyMaterialsConsumed(technicianId: string, orderId: string, materials: any[]) {
        this.server.to('rol-analista_inventario_oculto').emit('materials-consumed', {
            technicianId,
            orderId,
            materials,
        });
        console.log(`📢 Materiales consumidos por técnico ${technicianId}`);
    }

    notifyDiscrepancy(controlId: string, technicianId: string, data: any) {
        this.server.to('rol-analista_inventario_oculto').emit('materials-discrepancy', {
            controlId,
            technicianId,
            ...data,
        });
        this.server.to(`user-${technicianId}`).emit('materials-discrepancy', { controlId });
        console.log(`🚨 Descuadre detectado en control ${controlId}`);
    }

    notifyLowStock(technicianId: string, material: any) {
        this.server.to(`user-${technicianId}`).emit('low-stock', material);
        this.server.to('rol-analista_inventario_oculto').emit('low-stock', { technicianId, material });
        console.log(`⚠️ Stock bajo para técnico ${technicianId}: ${material.nombre}`);
    }

    // ==================== EVENTOS DE REPORTES ====================

    notifyNewVisitReport(report: any) {
        this.server.to('rol-analista').emit('visit-report-created', report);
        console.log('📢 Nuevo comprobante de visita');
    }

    // ==================== MENSAJES DIRECTOS ====================

    @SubscribeMessage('direct-message')
    handleDirectMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { recipientId: string; message: string }
    ) {
        const sender = Array.from(this.connectedUsers.values()).find(u => u.socketId === client.id);

        this.server.to(`user-${data.recipientId}`).emit('direct-message', {
            senderId: sender?.oderId,
            senderName: sender?.nombre,
            message: data.message,
            timestamp: new Date(),
        });

        return { success: true };
    }

    // ==================== UTILIDADES ====================

    broadcastToRole(rol: string, event: string, data: any) {
        this.server.to(`rol-${rol}`).emit(event, data);
    }

    private broadcastOnlineUsers() {
        const users = Array.from(this.connectedUsers.values()).map(u => ({
            oderId: u.oderId,
            nombre: u.nombre,
            rol: u.rol,
            connectedAt: u.connectedAt,
        }));
        this.server.emit('online-users', users);
    }

    getOnlineUsers(): ConnectedUser[] {
        return Array.from(this.connectedUsers.values());
    }

    getOnlineTechnicians(): ConnectedUser[] {
        return Array.from(this.connectedUsers.values()).filter(u => u.rol === 'tecnico');
    }

    isUserOnline(userId: string): boolean {
        return Array.from(this.connectedUsers.values()).some(u => u.oderId === userId);
    }
}
