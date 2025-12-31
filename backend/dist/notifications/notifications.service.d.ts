import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, NotificationPriority } from './schemas/notification.schema';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
import { UserDocument } from '../users/schemas/user.schema';
interface CreateNotificationDto {
    recipient_id: string;
    sender_id?: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    data?: any;
}
export declare class NotificationsService {
    private notificationModel;
    private userModel;
    private wsGateway;
    constructor(notificationModel: Model<NotificationDocument>, userModel: Model<UserDocument>, wsGateway: WebSocketGatewayService);
    create(dto: CreateNotificationDto): Promise<Notification>;
    notifyRole(role: string, dto: Omit<CreateNotificationDto, 'recipient_id'>): Promise<void>;
    notifyOrderCreated(order: any, analistaId: string): Promise<void>;
    notifyOrderAssigned(order: any, technicianId: string, analistaId: string): Promise<void>;
    notifyOrderStarted(order: any, technicianId: string): Promise<void>;
    notifyOrderProgress(order: any, fase: string, technicianId: string): Promise<void>;
    notifyOrderCompleted(order: any, technicianId: string): Promise<void>;
    notifyOrderImpossibility(order: any, technicianId: string, motivo: string): Promise<void>;
    notifyMaterialsAssigned(technicianId: string, materials: any[], assignedBy: string): Promise<void>;
    notifyMaterialsConsumed(technicianId: string, materials: any[], orderId: string, orderCodigo: string): Promise<void>;
    notifyMaterialsReturned(technicianId: string, materials: any[], controlId: string): Promise<void>;
    notifyLowStock(technicianId: string, material: any): Promise<void>;
    notifyDiscrepancy(controlId: string, technicianId: string, discrepancyData: any): Promise<void>;
    sendDirectMessage(senderId: string, recipientId: string, message: string): Promise<Notification>;
    findByUser(userId: string, query?: any): Promise<{
        data: Notification[];
        total: number;
        unread: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<{
        modified: number;
    }>;
    deleteOld(daysOld?: number): Promise<{
        deleted: number;
    }>;
}
export {};
