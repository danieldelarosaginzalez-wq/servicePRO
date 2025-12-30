import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;
export declare class Order {
    codigo: string;
    poliza_number: string;
    cliente: string;
    direccion: string;
    tipo_trabajo: string;
    analista_id: Types.ObjectId;
    tecnico_id?: Types.ObjectId;
    estado: string;
    materiales_sugeridos: Array<{
        material_id: Types.ObjectId;
        cantidad: number;
        motivo: string;
    }>;
    materiales_apartados: Array<{
        material_id: Types.ObjectId;
        cantidad: number;
        fecha_apartado: Date;
    }>;
    materiales_utilizados: Array<{
        material_id: Types.ObjectId;
        cantidad: number;
        fecha_uso: Date;
    }>;
    evidencias: {
        foto_inicial?: string;
        foto_durante?: string[];
        foto_materiales?: string[];
        foto_final?: string;
        fases_completadas?: string[];
    };
    imposibilidad?: {
        motivo: string;
        foto_tirilla: string;
        fecha: Date;
    };
    ubicacion: {
        lat: number;
        lng: number;
    };
    fecha_asignacion?: Date;
    fecha_inicio?: Date;
    fecha_finalizacion?: Date;
    fecha_creacion: Date;
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order, any, {}> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
