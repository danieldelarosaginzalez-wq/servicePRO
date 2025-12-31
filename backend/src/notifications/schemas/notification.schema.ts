import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType =
    // Órdenes
    | 'order_created'
    | 'order_assigned'
    | 'order_started'
    | 'order_progress'
    | 'order_completed'
    | 'order_impossibility'
    // Materiales
    | 'materials_assigned'
    | 'materials_consumed'
    | 'materials_returned'
    | 'materials_low_stock'
    | 'materials_discrepancy'
    // Comunicación
    | 'direct_message'
    | 'system_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

@Schema({ timestamps: true })
export class Notification {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    recipient_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    sender_id?: Types.ObjectId;

    @Prop({ required: true })
    type: NotificationType;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ default: 'medium' })
    priority: NotificationPriority;

    @Prop({ default: false })
    read: boolean;

    @Prop()
    read_at?: Date;

    @Prop({ type: Object })
    data?: {
        order_id?: string;
        order_codigo?: string;
        material_control_id?: string;
        materials?: any[];
        [key: string]: any;
    };

    @Prop({ default: Date.now })
    created_at: Date;

    @Prop()
    expires_at?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índices para búsquedas rápidas
NotificationSchema.index({ recipient_id: 1, read: 1 });
NotificationSchema.index({ recipient_id: 1, created_at: -1 });
NotificationSchema.index({ type: 1 });
