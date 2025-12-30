import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password_hash: string;

    @Prop({
        required: true,
        enum: ['analista', 'tecnico', 'analista_inventario_oculto']
    })
    rol: string;

    @Prop({
        required: true,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    })
    estado: string;

    @Prop({
        type: {
            lat: Number,
            lng: Number,
            timestamp: Date,
        }
    })
    ubicacion_actual?: {
        lat: number;
        lng: number;
        timestamp: Date;
    };
}

export const UserSchema = SchemaFactory.createForClass(User);