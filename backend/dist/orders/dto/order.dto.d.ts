export declare class CreateOrderDto {
    poliza_number: string;
    cliente: string;
    direccion: string;
    tipo_trabajo: string;
    analista_id?: string;
    tecnico_id?: string;
    materiales_sugeridos?: MaterialSugeridoDto[];
    'ubicacion.lat': number;
    'ubicacion.lng': number;
}
export declare class UpdateOrderDto {
    cliente?: string;
    direccion?: string;
    tipo_trabajo?: string;
    estado?: string;
    tecnico_id?: string;
    materiales_sugeridos?: MaterialSugeridoDto[];
}
export declare class AssignTechnicianDto {
    technicianId: string;
}
export declare class MaterialSugeridoDto {
    material_id: string;
    cantidad: number;
    motivo: string;
}
export declare class MaterialUtilizadoDto {
    material_id: string;
    cantidad: number;
}
export declare class FinishOrderDto {
    materiales_utilizados: MaterialUtilizadoDto[];
    evidencias?: {
        foto_final?: string;
        foto_materiales?: string[];
    };
}
export declare class ImpossibilityDto {
    motivo: string;
    foto_tirilla: string;
}
