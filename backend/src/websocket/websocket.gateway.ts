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
}

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
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
        console.log(`🔌 Cliente desconectado: ${client.id}`);
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
        });

        // Unir a sala según rol
        client.join(`rol-${data.rol}`);
        client.join(`user-${data.userId}`);

        console.log(`👤 Usuario registrado: ${data.nombre} (${data.rol})`);
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

    // Métodos para emitir eventos desde otros servicios

    notifyOrderCreated(order: any) {
        this.server.to('rol-analista').emit('order-created', order);
        console.log('📢 Notificación: Nueva orden creada');
    }

    notifyOrderAssigned(order: any, technicianId: string) {
        this.server.to(`user-${technicianId}`).emit('order-assigned', order);
        this.server.to('rol-analista').emit('order-updated', order);
        console.log(`📢 Notificación: Orden asignada a técnico ${technicianId}`);
    }

    notifyOrderStatusChanged(order: any) {
        this.server.to(`order-${order._id}`).emit('order-status-changed', order);
        this.server.to('rol-analista').emit('order-updated', order);

        if (order.tecnico_id) {
            const techId = typeof order.tecnico_id === 'object' ? order.tecnico_id._id : order.tecnico_id;
            this.server.to(`user-${techId}`).emit('order-updated', order);
        }
        console.log(`📢 Notificación: Estado de orden cambiado a ${order.estado}`);
    }

    notifyOrderProgress(order: any, fase: string) {
        this.server.to(`order-${order._id}`).emit('order-progress', { order, fase });
        this.server.to('rol-analista').emit('order-progress', { order, fase });
        console.log(`📢 Notificación: Progreso de orden - fase ${fase}`);
    }

    notifyInventoryUpdated(technicianId: string, data: any) {
        this.server.to(`user-${technicianId}`).emit('inventory-updated', data);
        this.server.to('rol-analista_inventario_oculto').emit('inventory-updated', { technicianId, ...data });
        console.log(`📢 Notificación: Inventario actualizado para técnico ${technicianId}`);
    }

    notifyMaterialAssigned(technicianId: string, materials: any[]) {
        this.server.to(`user-${technicianId}`).emit('materials-assigned', materials);
        console.log(`📢 Notificación: Materiales asignados a técnico ${technicianId}`);
    }

    notifyNewVisitReport(report: any) {
        this.server.to('rol-analista').emit('visit-report-created', report);
        console.log('📢 Notificación: Nuevo comprobante de visita');
    }

    sendNotification(userId: string, notification: { title: string; message: string; type: string }) {
        this.server.to(`user-${userId}`).emit('notification', notification);
        console.log(`📢 Notificación enviada a usuario ${userId}: ${notification.title}`);
    }

    broadcastToRole(rol: string, event: string, data: any) {
        this.server.to(`rol-${rol}`).emit(event, data);
    }

    private broadcastOnlineUsers() {
        const users = Array.from(this.connectedUsers.values());
        this.server.emit('online-users', users);
    }

    getOnlineUsers(): ConnectedUser[] {
        return Array.from(this.connectedUsers.values());
    }

    isUserOnline(userId: string): boolean {
        return Array.from(this.connectedUsers.values()).some(u => u.oderId === userId);
    }
}
