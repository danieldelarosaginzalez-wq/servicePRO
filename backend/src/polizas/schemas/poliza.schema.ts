import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PolizaDocument = Poliza & Document;

@Schema({ timestamps: true })
export class Poliza {
    @Prop({ required: true, unique: true })
    poliza_number: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop({ required: true })
    cliente: string;

    @Prop({ required: true })
    direccion: string;

    @Prop({
        type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            geocoded: { type: Boolean, default: false },
        }
    })
    ubicacion: {
        lat: number;
        lng: number;
        geocoded: boolean;
    };

    @Prop({
        required: true,
        enum: ['activo', 'anulada'],
        default: 'activo'
    })
    estado: string;

    @Prop({
        type: {
            costo_maximo: Number,
        }
    })
    metadata?: {
        costo_maximo?: number;
        [key: string]: any;
    };
}

export const PolizaSchema = SchemaFactory.createForClass(Poliza);