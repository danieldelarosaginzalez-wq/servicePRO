import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(req: any, query: any): Promise<{
        data: import("./schemas/notification.schema").Notification[];
        total: number;
        unread: number;
    }>;
    getUnreadCount(req: any): Promise<{
        unread: number;
    }>;
    markAsRead(id: string, req: any): Promise<{
        success: boolean;
        data: import("./schemas/notification.schema").Notification;
    }>;
    markAllAsRead(req: any): Promise<{
        modified: number;
        success: boolean;
    }>;
    sendDirectMessage(req: any, body: {
        recipientId: string;
        message: string;
    }): Promise<{
        success: boolean;
        data: import("./schemas/notification.schema").Notification;
    }>;
    cleanupOldNotifications(days: string): Promise<{
        deleted: number;
        success: boolean;
    }>;
}
