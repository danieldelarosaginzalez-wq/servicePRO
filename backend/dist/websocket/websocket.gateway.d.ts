import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface ConnectedUser {
    odId: string;
    oderId: string;
    rol: string;
    nombre: string;
    socketId: string;
    connectedAt: Date;
}
export declare class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private connectedUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(client: Socket, data: {
        userId: string;
        rol: string;
        nombre: string;
    }): {
        success: boolean;
        message: string;
    };
    handleJoinOrder(client: Socket, data: {
        orderId: string;
    }): {
        success: boolean;
    };
    handleLeaveOrder(client: Socket, data: {
        orderId: string;
    }): {
        success: boolean;
    };
    sendNotification(userId: string, notification: any): void;
    sendNotificationToRole(rol: string, notification: any): void;
    notifyOrderCreated(order: any): void;
    notifyOrderAssigned(order: any, technicianId: string): void;
    notifyOrderStatusChanged(order: any): void;
    notifyOrderProgress(order: any, fase: string): void;
    notifyOrderCompleted(order: any): void;
    notifyOrderImpossibility(order: any): void;
    notifyInventoryUpdated(technicianId: string, data: any): void;
    notifyMaterialAssigned(technicianId: string, materials: any[]): void;
    notifyMaterialsConsumed(technicianId: string, orderId: string, materials: any[]): void;
    notifyDiscrepancy(controlId: string, technicianId: string, data: any): void;
    notifyLowStock(technicianId: string, material: any): void;
    notifyNewVisitReport(report: any): void;
    handleDirectMessage(client: Socket, data: {
        recipientId: string;
        message: string;
    }): {
        success: boolean;
    };
    broadcastToRole(rol: string, event: string, data: any): void;
    private broadcastOnlineUsers;
    getOnlineUsers(): ConnectedUser[];
    getOnlineTechnicians(): ConnectedUser[];
    isUserOnline(userId: string): boolean;
}
export {};
