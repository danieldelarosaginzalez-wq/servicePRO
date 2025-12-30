import { Document } from 'mongoose';
export type PolizaDocument = Poliza & Document;
export declare class Poliza {
    poliza_number: string;
    descripcion: string;
    cliente: string;
    direccion: string;
    ubicacion: {
        lat: number;
        lng: number;
        geocoded: boolean;
    };
    estado: string;
    metadata?: {
        costo_maximo?: number;
        [key: string]: any;
    };
}
export declare const PolizaSchema: import("mongoose").Schema<Poliza, import("mongoose").Model<Poliza, any, any, any, Document<unknown, any, Poliza, any, {}> & Poliza & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Poliza, Document<unknown, {}, import("mongoose").FlatRecord<Poliza>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Poliza> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
