import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface ConnectedUser {
    odId: string;
    oderId: string;
    rol: string;
    nombre: string;
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
    notifyOrderCreated(order: any): void;
    notifyOrderAssigned(order: any, technicianId: string): void;
    notifyOrderStatusChanged(order: any): void;
    notifyOrderProgress(order: any, fase: string): void;
    notifyInventoryUpdated(technicianId: string, data: any): void;
    notifyMaterialAssigned(technicianId: string, materials: any[]): void;
    notifyNewVisitReport(report: any): void;
    sendNotification(userId: string, notification: {
        title: string;
        message: string;
        type: string;
    }): void;
    broadcastToRole(rol: string, event: string, data: any): void;
    private broadcastOnlineUsers;
    getOnlineUsers(): ConnectedUser[];
    isUserOnline(userId: string): boolean;
}
export {};
