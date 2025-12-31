// Tipos compartidos entre frontend y backend

export interface User {
    _id: string;
    nombre: string;
    email: string;
    rol: 'analista' | 'tecnico' | 'analista_inventario_oculto';
    estado: 'activo' | 'inactivo';
    ubicacion_actual?: { lat: number; lng: number; timestamp: Date };
}

export interface Poliza {
    _id: string;
    poliza_number: string;
    descripcion: string;
    cliente: string;
    direccion: string;
    ubicacion: { lat: number; lng: number; geocoded: boolean };
    estado: 'activo' | 'anulada';
    metadata?: { costo_maximo?: number;[key: string]: any };
}

export interface Order {
    _id: string;
    codigo: string;
    poliza_number: string;
    cliente: string;
    direccion: string;
    tipo_trabajo: 'instalacion' | 'mantenimiento' | 'reparacion' | 'inspeccion';
    analista_id: string | User;
    tecnico_id?: string | User;
    estado: 'creada' | 'asignada' | 'en_proceso' | 'finalizada' | 'imposibilidad' | 'pendiente_revision' | 'cerrada';
    materiales_sugeridos: MaterialSugerido[];
    materiales_apartados: MaterialApartado[];
    materiales_utilizados: MaterialUtilizado[];
    evidencias: { foto_inicial?: string; foto_durante?: string[]; foto_materiales?: string[]; foto_final?: string };
    imposibilidad?: { motivo: string; foto_tirilla: string; fecha: Date };
    ubicacion: { lat: number; lng: number };
    fecha_creacion: Date;
    fecha_asignacion?: Date;
    fecha_inicio?: Date;
    fecha_finalizacion?: Date;
}

export interface Material {
    _id: string;
    nombre: string;
    codigo: string;
    descripcion: string;
    unidad_medida: string;
    costo_unitario: number;
    categoria: string;
    stock_minimo: number;
    estado: 'activo' | 'inactivo';
}

export interface MaterialSugerido { material_id: string; cantidad: number; motivo: string; }
export interface MaterialApartado { material_id: string; cantidad: number; fecha_apartado: Date; }
export interface MaterialUtilizado { material_id: string; cantidad: number; fecha_uso: Date; }


export interface InventoryTechnician {
    _id: string;
    tecnico_id: string;
    materials: {
        material_id: string;
        material?: { nombre: string; codigo: string; unidad_medida: string };
        cantidad_actual: number;
        cantidad_apartada: number;
        cantidad_disponible: number;
        ultimo_movimiento: Date;
    }[];
}


export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
