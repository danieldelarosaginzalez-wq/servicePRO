import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
    @Prop({ required: true, unique: true })
    codigo: string;

    @Prop({ required: true })
    poliza_number: string;

    @Prop({ required: true })
    cliente: string;

    @Prop({ required: true })
    direccion: string;

    @Prop({
        required: true,
        enum: ['instalacion', 'mantenimiento', 'reparacion', 'inspeccion']
    })
    tipo_trabajo: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    analista_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    tecnico_id?: Types.ObjectId;

    @Prop({
        required: true,
        enum: ['creada', 'asignada', 'en_proceso', 'finalizada', 'imposibilidad', 'pendiente_revision', 'cerrada'],
        default: 'creada'
    })
    estado: string;

    @Prop([{
        material_id: { type: Types.ObjectId, ref: 'Material' },
        cantidad: Number,
        motivo: String,
    }])
    materiales_sugeridos: Array<{
        material_id: Types.ObjectId;
        cantidad: number;
        motivo: string;
    }>;

    @Prop([{
        material_id: { type: Types.ObjectId, ref: 'Material' },
        cantidad: Number,
        fecha_apartado: Date,
    }])
    materiales_apartados: Array<{
        material_id: Types.ObjectId;
        cantidad: number;
        fecha_apartado: Date;
    }>;

    @Prop([{
        material_id: { type: Types.ObjectId, ref: 'Material' },
        cantidad: Number,
        fecha_uso: Date,
    }])
    materiales_utilizados: Array<{
        material_id: Types.ObjectId;
        cantidad: number;
        fecha_uso: Date;
    }>;

    @Prop({
        type: {
            foto_inicial: String,
            foto_durante: [String],
            foto_materiales: [String],
            foto_final: String,
            fases_completadas: [String],
        }
    })
    evidencias: {
        foto_inicial?: string;
        foto_durante?: string[];
        foto_materiales?: string[];
        foto_final?: string;
        fases_completadas?: string[];
    };

    @Prop({
        type: {
            motivo: String,
            foto_tirilla: String,
            fecha: Date,
        }
    })
    imposibilidad?: {
        motivo: string;
        foto_tirilla: string;
        fecha: Date;
    };

    @Prop({
        type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        }
    })
    ubicacion: {
        lat: number;
        lng: number;
    };

    @Prop()
    fecha_asignacion?: Date;

    @Prop()
    fecha_inicio?: Date;

    @Prop()
    fecha_finalizacion?: Date;

    @Prop({ default: Date.now })
    fecha_creacion: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);