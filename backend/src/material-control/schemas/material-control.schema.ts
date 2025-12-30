import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MaterialControlDocument = MaterialControl & Document;

@Schema({ timestamps: true })
export class MaterialControl {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    tecnico_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Order' })
    orden_trabajo_id?: Types.ObjectId;

    @Prop({ type: [Object], default: [] })
    materiales_asignados: {
        material_id: Types.ObjectId;
        nombre: string;
        codigo: string;
        cantidad_asignada: number;
        cantidad_utilizada: number;
        cantidad_devuelta: number;
        cantidad_perdida: number;
        estado: 'pendiente' | 'en_uso' | 'completado' | 'devuelto_parcial' | 'devuelto_total';
    }[];

    @Prop({
        default: 'asignado',
        enum: ['asignado', 'en_trabajo', 'trabajo_completado', 'devolucion_pendiente', 'devolucion_completada', 'cerrado', 'entregado_masivo']
    })
    estado_general: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    bodeguero_asigno: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    analista_supervisa?: Types.ObjectId;

    @Prop({ default: false })
    tiene_descuadre: boolean;

    @Prop()
    valor_descuadre?: number;

    @Prop({ default: false })
    descuadre_resuelto: boolean;

    @Prop()
    motivo_descuadre?: string;

    @Prop()
    resolucion_descuadre?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    resuelto_por?: Types.ObjectId;

    @Prop()
    fecha_resolucion?: Date;

    @Prop()
    fecha_creacion: Date;

    @Prop()
    fecha_cierre?: Date;

    @Prop({ type: [Object], default: [] })
    historial: {
        accion: string;
        usuario_id: Types.ObjectId;
        fecha: Date;
        detalles?: any;
    }[];
}

export const MaterialControlSchema = SchemaFactory.createForClass(MaterialControl);

// Índices
MaterialControlSchema.index({ tecnico_id: 1 });
MaterialControlSchema.index({ orden_trabajo_id: 1 });
MaterialControlSchema.index({ estado_general: 1 });
MaterialControlSchema.index({ tiene_descuadre: 1 });
