import { Document, Types } from 'mongoose';
export type MaterialControlDocument = MaterialControl & Document;
export declare class MaterialControl {
    tecnico_id: Types.ObjectId;
    orden_trabajo_id?: Types.ObjectId;
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
    estado_general: string;
    bodeguero_asigno: Types.ObjectId;
    analista_supervisa?: Types.ObjectId;
    tiene_descuadre: boolean;
    valor_descuadre?: number;
    descuadre_resuelto: boolean;
    motivo_descuadre?: string;
    resolucion_descuadre?: string;
    resuelto_por?: Types.ObjectId;
    fecha_resolucion?: Date;
    fecha_creacion: Date;
    fecha_cierre?: Date;
    historial: {
        accion: string;
        usuario_id: Types.ObjectId;
        fecha: Date;
        detalles?: any;
    }[];
}
export declare const MaterialControlSchema: import("mongoose").Schema<MaterialControl, import("mongoose").Model<MaterialControl, any, any, any, Document<unknown, any, MaterialControl, any, {}> & MaterialControl & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MaterialControl, Document<unknown, {}, import("mongoose").FlatRecord<MaterialControl>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<MaterialControl> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
