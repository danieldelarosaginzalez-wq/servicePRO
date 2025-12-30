import { Document, Types } from 'mongoose';
export type VisitReportDocument = VisitReport & Document;
export declare class VisitReport {
    order_id: Types.ObjectId;
    numero_comprobante: string;
    identificacion_servicio: {
        poliza: string;
        abonado: string;
        direccion: string;
        telefono?: string;
        email?: string;
    };
    bloque_operativo: {
        operario: string;
        operario_id: string;
        orden: string;
        tipo_proceso: string;
        fecha_visita: Date;
        hora_inicio?: string;
        hora_fin?: string;
    };
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
    fotos_evidencia: string[];
    estado: string;
    pdf_generado?: string;
    creado_por: Types.ObjectId;
    fecha_creacion: Date;
    fecha_finalizacion?: Date;
}
export declare const VisitReportSchema: import("mongoose").Schema<VisitReport, import("mongoose").Model<VisitReport, any, any, any, Document<unknown, any, VisitReport, any, {}> & VisitReport & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, VisitReport, Document<unknown, {}, import("mongoose").FlatRecord<VisitReport>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<VisitReport> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
