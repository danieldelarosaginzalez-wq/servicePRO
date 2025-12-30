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
        console.log(`🔌 Cliente desconectado: ${client.id}`);
        this.connectedUsers.delete(client.id);
        this.broadcastOnlineUsers();
    }
    handleRegister(client, data) {
        this.connectedUsers.set(client.id, {
            odId: data.userId,
            oderId: data.userId,
            rol: data.rol,
            nombre: data.nombre,
        });
        client.join(`rol-${data.rol}`);
        client.join(`user-${data.userId}`);
        console.log(`👤 Usuario registrado: ${data.nombre} (${data.rol})`);
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
    notifyOrderCreated(order) {
        this.server.to('rol-analista').emit('order-created', order);
        console.log('📢 Notificación: Nueva orden creada');
    }
    notifyOrderAssigned(order, technicianId) {
        this.server.to(`user-${technicianId}`).emit('order-assigned', order);
        this.server.to('rol-analista').emit('order-updated', order);
        console.log(`📢 Notificación: Orden asignada a técnico ${technicianId}`);
    }
    notifyOrderStatusChanged(order) {
        this.server.to(`order-${order._id}`).emit('order-status-changed', order);
        this.server.to('rol-analista').emit('order-updated', order);
        if (order.tecnico_id) {
            const techId = typeof order.tecnico_id === 'object' ? order.tecnico_id._id : order.tecnico_id;
            this.server.to(`user-${techId}`).emit('order-updated', order);
        }
        console.log(`📢 Notificación: Estado de orden cambiado a ${order.estado}`);
    }
    notifyOrderProgress(order, fase) {
        this.server.to(`order-${order._id}`).emit('order-progress', { order, fase });
        this.server.to('rol-analista').emit('order-progress', { order, fase });
        console.log(`📢 Notificación: Progreso de orden - fase ${fase}`);
    }
    notifyInventoryUpdated(technicianId, data) {
        this.server.to(`user-${technicianId}`).emit('inventory-updated', data);
        this.server.to('rol-analista_inventario_oculto').emit('inventory-updated', { technicianId, ...data });
        console.log(`📢 Notificación: Inventario actualizado para técnico ${technicianId}`);
    }
    notifyMaterialAssigned(technicianId, materials) {
        this.server.to(`user-${technicianId}`).emit('materials-assigned', materials);
        console.log(`📢 Notificación: Materiales asignados a técnico ${technicianId}`);
    }
    notifyNewVisitReport(report) {
        this.server.to('rol-analista').emit('visit-report-created', report);
        console.log('📢 Notificación: Nuevo comprobante de visita');
    }
    sendNotification(userId, notification) {
        this.server.to(`user-${userId}`).emit('notification', notification);
        console.log(`📢 Notificación enviada a usuario ${userId}: ${notification.title}`);
    }
    broadcastToRole(rol, event, data) {
        this.server.to(`rol-${rol}`).emit(event, data);
    }
    broadcastOnlineUsers() {
        const users = Array.from(this.connectedUsers.values());
        this.server.emit('online-users', users);
    }
    getOnlineUsers() {
        return Array.from(this.connectedUsers.values());
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
exports.WebSocketGatewayService = WebSocketGatewayService = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            credentials: true,
        },
    })
], WebSocketGatewayService);
//# sourceMappingURL=websocket.gateway.js.map