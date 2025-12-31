import { apiService } from './apiService';

export interface Notification {
    _id: string;
    recipient_id: string;
    sender_id?: {
        _id: string;
        nombre: string;
        email: string;
        rol: string;
    };
    type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    read: boolean;
    read_at?: string;
    data?: any;
    created_at: string;
}

export interface NotificationsResponse {
    data: Notification[];
    total: number;
    unread: number;
}

class NotificationService {
    async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<NotificationsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

        const response = await apiService.get<NotificationsResponse>(
            `/notifications?${queryParams.toString()}`
        );
        return response.data;
    }

    async getUnreadCount(): Promise<number> {
        const response = await apiService.get<{ unread: number }>('/notifications/unread-count');
        return response.data.unread;
    }

    async markAsRead(notificationId: string): Promise<void> {
        await apiService.patch(`/notifications/${notificationId}/read`, {});
    }

    async markAllAsRead(): Promise<{ modified: number }> {
        const response = await apiService.patch<{ success: boolean; modified: number }>(
            '/notifications/read-all',
            {}
        );
        return { modified: response.data.modified };
    }

    async sendDirectMessage(recipientId: string, message: string): Promise<void> {
        await apiService.post('/notifications/send-message', { recipientId, message });
    }

    // Helpers para iconos y colores según tipo
    getNotificationIcon(type: string): string {
        const icons: Record<string, string> = {
            order_created: '📋',
            order_assigned: '🔧',
            order_started: '▶️',
            order_progress: '📸',
            order_completed: '✅',
            order_impossibility: '⚠️',
            materials_assigned: '📦',
            materials_consumed: '📉',
            materials_returned: '↩️',
            materials_low_stock: '⚠️',
            materials_discrepancy: '🚨',
            direct_message: '💬',
            system_alert: '🔔',
        };
        return icons[type] || '🔔';
    }

    getPriorityColor(priority: string): string {
        const colors: Record<string, string> = {
            low: '#9e9e9e',
            medium: '#2196f3',
            high: '#ff9800',
            urgent: '#f44336',
        };
        return colors[priority] || '#2196f3';
    }
}

export const notificationService = new NotificationService();
export default notificationService;
