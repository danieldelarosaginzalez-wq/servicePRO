import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
    @IsString()
    poliza_number: string;

    @IsString()
    cliente: string;

    @IsString()
    direccion: string;

    @IsEnum(['instalacion', 'mantenimiento', 'reparacion', 'inspeccion'])
    tipo_trabajo: string;

    @IsOptional()
    @IsMongoId()
    analista_id?: string;

    @IsOptional()
    @IsMongoId()
    tecnico_id?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialSugeridoDto)
    materiales_sugeridos?: MaterialSugeridoDto[];

    @IsNumber()
    @Type(() => Number)
    'ubicacion.lat': number;

    @IsNumber()
    @Type(() => Number)
    'ubicacion.lng': number;
}

export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    cliente?: string;

    @IsOptional()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsEnum(['instalacion', 'mantenimiento', 'reparacion', 'inspeccion'])
    tipo_trabajo?: string;

    @IsOptional()
    @IsEnum(['creada', 'asignada', 'en_proceso', 'finalizada', 'imposibilidad', 'pendiente_revision', 'cerrada'])
    estado?: string;

    @IsOptional()
    @IsMongoId()
    tecnico_id?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialSugeridoDto)
    materiales_sugeridos?: MaterialSugeridoDto[];
}

export class AssignTechnicianDto {
    @IsMongoId()
    technicianId: string;
}

export class MaterialSugeridoDto {
    @IsMongoId()
    material_id: string;

    @IsNumber()
    cantidad: number;

    @IsString()
    motivo: string;
}

export class MaterialUtilizadoDto {
    @IsMongoId()
    material_id: string;

    @IsNumber()
    cantidad: number;
}

export class FinishOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialUtilizadoDto)
    materiales_utilizados: MaterialUtilizadoDto[];

    @IsOptional()
    evidencias?: {
        foto_final?: string;
        foto_materiales?: string[];
    };
}

export class ImpossibilityDto {
    @IsString()
    motivo: string;

    @IsString()
    foto_tirilla: string;
}