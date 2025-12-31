import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export type NotificationType = 'order_created' | 'order_assigned' | 'order_started' | 'order_progress' | 'order_completed' | 'order_impossibility' | 'materials_assigned' | 'materials_consumed' | 'materials_returned' | 'materials_low_stock' | 'materials_discrepancy' | 'direct_message' | 'system_alert';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export declare class Notification {
    recipient_id: Types.ObjectId;
    sender_id?: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    read: boolean;
    read_at?: Date;
    data?: {
        order_id?: string;
        order_codigo?: string;
        material_control_id?: string;
        materials?: any[];
        [key: string]: any;
    };
    created_at: Date;
    expires_at?: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
