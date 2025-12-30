import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MaterialDocument = Material & Document;

@Schema({ timestamps: true })
export class Material {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true, unique: true })
    codigo: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop({ required: true })
    unidad_medida: string;

    @Prop({ required: true, min: 0 })
    costo_unitario: number;

    @Prop({ required: true })
    categoria: string;

    @Prop({ required: true, min: 0 })
    stock_minimo: number;

    @Prop({
        required: true,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    })
    estado: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);