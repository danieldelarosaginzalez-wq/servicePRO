import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VisitReportDocument = VisitReport & Document;

@Schema({ timestamps: true })
export class VisitReport {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    order_id: Types.ObjectId;

    @Prop({ required: true, unique: true })
    numero_comprobante: string;

    @Prop({ type: Object, required: true })
    identificacion_servicio: {
        poliza: string;
        abonado: string;
        direccion: string;
        telefono?: string;
        email?: string;
    };

    @Prop({ type: Object, required: true })
    bloque_operativo: {
        operario: string;
        operario_id: string;
        orden: string;
        tipo_proceso: string;
        fecha_visita: Date;
        hora_inicio?: string;
        hora_fin?: string;
    };

    @Prop({ type: Object })
    trabajo_realizado: {
        descripcion: string;
        observaciones?: string;
        materiales_utilizados?: {
            material_id: string;
            nombre: string;
            cantidad: number;
            unidad: string;
        }[];
    };

    @Prop({ type: Object })
    firmas: {
        funcionario?: {
            nombre: string;
            cargo?: string;
            firma_imagen?: string;
            fecha: Date;
        };
        operario?: {
            nombre: string;
            firma_imagen?: string;
            fecha: Date;
        };
        usuario_suscriptor?: {
            nombre: string;
            documento?: string;
            firma_imagen?: string;
            fecha: Date;
        };
        testigos?: {
            nombre: string;
            documento?: string;
            firma_imagen?: string;
        }[];
    };

    @Prop({ type: [String] })
    fotos_evidencia: string[];

    @Prop({ default: 'borrador', enum: ['borrador', 'pendiente_firma', 'firmado', 'finalizado'] })
    estado: string;

    @Prop()
    pdf_generado?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    creado_por: Types.ObjectId;

    @Prop()
    fecha_creacion: Date;

    @Prop()
    fecha_finalizacion?: Date;
}

export const VisitReportSchema = SchemaFactory.createForClass(VisitReport);

// Índices
VisitReportSchema.index({ order_id: 1 });
VisitReportSchema.index({ numero_comprobante: 1 }, { unique: true });
VisitReportSchema.index({ estado: 1 });
VisitReportSchema.index({ 'bloque_operativo.operario_id': 1 });
