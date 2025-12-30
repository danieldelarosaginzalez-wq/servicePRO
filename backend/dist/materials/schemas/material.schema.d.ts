import { Document } from 'mongoose';
export type MaterialDocument = Material & Document;
export declare class Material {
    nombre: string;
    codigo: string;
    descripcion: string;
    unidad_medida: string;
    costo_unitario: number;
    categoria: string;
    stock_minimo: number;
    estado: string;
}
export declare const MaterialSchema: import("mongoose").Schema<Material, import("mongoose").Model<Material, any, any, any, Document<unknown, any, Material, any, {}> & Material & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Material, Document<unknown, {}, import("mongoose").FlatRecord<Material>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Material> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
