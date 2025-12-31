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
exports.WebSocketGatewayService = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let WebSocketGatewayService = class WebSocketGatewayService {
    constructor() {
        this.connectedUsers = new Map();
    }
    handleConnection(client) {
        console.log(`🔌 Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        const user = this.connectedUsers.get(client.id);
        if (user) {
            console.log(`🔌 Usuario desconectado: ${user.nombre} (${user.rol})`);
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
    handleRegister(client, data) {
        this.connectedUsers.set(client.id, {
            odId: data.userId,
            oderId: data.userId,
            rol: data.rol,
            nombre: data.nombre,
            socketId: client.id,
            connectedAt: new Date(),
        });
        client.join(`rol-${data.rol}`);
        client.join(`user-${data.userId}`);
        console.log(`👤 Usuario registrado: ${data.nombre} (${data.rol})`);
        if (data.rol === 'tecnico') {
            this.server.to('rol-analista').emit('technician-online', {
                userId: data.userId,
                nombre: data.nombre,
            });
        }
        this.broadcastOnlineUsers();
        return { success: true, message: 'Registrado correctamente' };
    }
    handleJoinOrder(client, data) {
        client.join(`order-${data.orderId}`);
        return { success: true };
    }
    handleLeaveOrder(client, data) {
        client.leave(`order-${data.orderId}`);
        return { success: true };
    }
    sendNotification(userId, notification) {
        this.server.to(`user-${userId}`).emit('notification', notification);
        console.log(`📢 Notificación enviada a ${userId}: ${notification.title}`);
    }
    sendNotificationToRole(rol, notification) {
        this.server.to(`rol-${rol}`).emit('notification', notification);
        console.log(`📢 Notificación enviada a rol ${rol}: ${notification.title}`);
    }
    notifyOrderCreated(order) {
        this.server.to('rol-analista').emit('order-created', order);
        console.log('📢 Nueva orden creada:', order.codigo);
    }
    notifyOrderAssigned(order, technicianId) {
        this.server.to(`user-${technicianId}`).emit('order-assigned', order);
        this.server.to('rol-analista').emit('order-updated', order);
        console.log(`📢 Orden ${order.codigo} asignada a técnico ${technicianId}`);
    }
    notifyOrderStatusChanged(order) {
        this.server.to(`order-${order._id}`).emit('order-status-changed', order);
        this.server.to('rol-analista').emit('order-updated', order);
        if (order.tecnico_id) {
            const techId = typeof order.tecnico_id === 'object' ? order.tecnico_id._id : order.tecnico_id;
            this.server.to(`user-${techId}`).emit('order-updated', order);
        }
        console.log(`📢 Estado de orden ${order.codigo} cambiado a ${order.estado}`);
    }
    notifyOrderProgress(order, fase) {
        this.server.to(`order-${order._id}`).emit('order-progress', { order, fase });
        this.server.to('rol-analista').emit('order-progress', { order, fase });
        console.log(`📢 Progreso de orden ${order.codigo} - fase ${fase}`);
    }
    notifyOrderCompleted(order) {
        this.server.to('rol-analista').emit('order-completed', order);
        this.server.to('rol-analista_inventario_oculto').emit('order-completed', order);
        console.log(`📢 Orden ${order.codigo} completada`);
    }
    notifyOrderImpossibility(order) {
        this.server.to('rol-analista').emit('order-impossibility', order);
        console.log(`📢 Imposibilidad en orden ${order.codigo}`);
    }
    notifyInventoryUpdated(technicianId, data) {
        this.server.to(`user-${technicianId}`).emit('inventory-updated', data);
        this.server.to('rol-analista_inventario_oculto').emit('inventory-updated', { technicianId, ...data });
        console.log(`📢 Inventario actualizado para técnico ${technicianId}`);
    }
    notifyMaterialAssigned(technicianId, materials) {
        this.server.to(`user-${technicianId}`).emit('materials-assigned', materials);
        console.log(`📢 Materiales asignados a técnico ${technicianId}`);
    }
    notifyMaterialsConsumed(technicianId, orderId, materials) {
        this.server.to('rol-analista_inventario_oculto').emit('materials-consumed', {
            technicianId,
            orderId,
            materials,
        });
        console.log(`📢 Materiales consumidos por técnico ${technicianId}`);
    }
    notifyDiscrepancy(controlId, technicianId, data) {
        this.server.to('rol-analista_inventario_oculto').emit('materials-discrepancy', {
            controlId,
            technicianId,
            ...data,
        });
        this.server.to(`user-${technicianId}`).emit('materials-discrepancy', { controlId });
        console.log(`🚨 Descuadre detectado en control ${controlId}`);
    }
    notifyLowStock(technicianId, material) {
        this.server.to(`user-${technicianId}`).emit('low-stock', material);
        this.server.to('rol-analista_inventario_oculto').emit('low-stock', { technicianId, material });
        console.log(`⚠️ Stock bajo para técnico ${technicianId}: ${material.nombre}`);
    }
    notifyNewVisitReport(report) {
        this.server.to('rol-analista').emit('visit-report-created', report);
        console.log('📢 Nuevo comprobante de visita');
    }
    handleDirectMessage(client, data) {
        const sender = Array.from(this.connectedUsers.values()).find(u => u.socketId === client.id);
        this.server.to(`user-${data.recipientId}`).emit('direct-message', {
            senderId: sender?.oderId,
            senderName: sender?.nombre,
            message: data.message,
            timestamp: new Date(),
        });
        return { success: true };
    }
    broadcastToRole(rol, event, data) {
        this.server.to(`rol-${rol}`).emit(event, data);
    }
    broadcastOnlineUsers() {
        const users = Array.from(this.connectedUsers.values()).map(u => ({
            oderId: u.oderId,
            nombre: u.nombre,
            rol: u.rol,
            connectedAt: u.connectedAt,
        }));
        this.server.emit('online-users', users);
    }
    getOnlineUsers() {
        return Array.from(this.connectedUsers.values());
    }
    getOnlineTechnicians() {
        return Array.from(this.connectedUsers.values()).filter(u => u.rol === 'tecnico');
    }
    isUserOnline(userId) {
        return Array.from(this.connectedUsers.values()).some(u => u.oderId === userId);
    }
};
exports.WebSocketGatewayService = WebSocketGatewayService;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketGatewayService.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayService.prototype, "handleRegister", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-order'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayService.prototype, "handleJoinOrder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-order'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayService.prototype, "handleLeaveOrder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('direct-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayService.prototype, "handleDirectMessage", null);
exports.WebSocketGatewayService = WebSocketGatewayService = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            credentials: true,
        },
    })
], WebSocketGatewayService);
//# sourceMappingURL=websocket.gateway.js.map