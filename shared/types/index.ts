// Tipos compartidos entre frontend y backend

export interface User {
    _id: string;
    nombre: string;
    email: string;
    rol: 'analista' | 'tecnico' | 'analista_inventario_oculto';
    estado: 'activo' | 'inactivo';
    ubicacion_actual?: {
        lat: number;
        lng: number;
        timestamp: Date;
    };
}

export interface Poliza {
    _id: string;
    poliza_number: string;
    descripcion: string;
    cliente: string;
    direccion: string;
    ubicacion: {
        lat: number;
        lng: number;
        geocoded: boolean;
    };
    estado: 'activo' | 'anulada';
    metadata?: {
        costo_maximo?: number;
        [key: string]: any;
    };
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
    evidencias: {
        foto_inicial?: string;
        foto_durante?: string[];
        foto_materiales?: string[];
        foto_final?: string;
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

export interface InventoryTechnician {
    _id: string;
    tecnico_id: string;
    materials: {
        material_id: string;
        material?: {
            nombre: string;
            codigo: string;
            unidad_medida: string;
        };
        cantidad_actual: number;
        cantidad_apartada: number;
        cantidad_disponible: number;
        ultimo_movimiento: Date;
    }[];
}

export interface MovimientoInventario {
    _id: string;
    tecnico_id: string;
    material_id: string;
    tipo: 'entrada' | 'salida' | 'apartado' | 'ajuste' | 'devolucion';
    cantidad: number;
    motivo: string;
    usuario_responsable: string;
    origen: 'OT' | 'poliza' | 'Excel' | 'AjusteAutomatico' | 'Manual';
    referencia_origen_id?: string;
    fecha: Date;
    visible_para_analistas: boolean;
}

export interface MaterialControl {
    _id: string;
    tecnico_id: string;
    orden_trabajo_id?: string;
    materiales_asignados: {
        material_id: string;
        cantidad_asignada: number;
        cantidad_utilizada: number;
        cantidad_devuelta: number;
        cantidad_perdida: number;
        estado: 'pendiente' | 'en_uso' | 'completado' | 'devuelto_parcial' | 'devuelto_total';
    }[];
    estado_general: 'asignado' | 'en_trabajo' | 'trabajo_completado' | 'devolucion_pendiente' | 'devolucion_completada' | 'cerrado' | 'entregado_masivo';
    bodeguero_asigno: string;
    analista_supervisa: string;
    tiene_descuadre: boolean;
    valor_descuadre?: number;
    descuadre_resuelto: boolean;
    fecha_creacion: Date;
}

export interface AcuacarVisitReport {
    _id: string;
    order_id: string;
    numero_comprobante: string;
    identificacion_servicio: {
        poliza: string;
        abonado: string;
        direccion: string;
    };
    bloque_operativo: {
        operario: string;
        orden: string;
        tipo_proceso: string;
    };
    firmas: {
        funcionario_acuacar?: string;
        operario?: string;
        usuario_suscriptor?: string;
        testigos?: string[];
    };
    estado: 'borrador' | 'finalizado' | 'firmado';
    fecha_creacion: Date;
}

// Tipos auxiliares
export interface MaterialSugerido {
    material_id: string;
    cantidad: number;
    motivo: string;
}

export interface MaterialApartado {
    material_id: string;
    cantidad: number;
    fecha_apartado: Date;
}

export interface MaterialUtilizado {
    material_id: string;
    cantidad: number;
    fecha_uso: Date;
}

// Tipos para Grid Excel
export interface GridColumn {
    field: string;
    headerName: string;
    width?: number;
    editable?: boolean;
    cellEditor?: string;
    cellRenderer?: string;
    filter?: boolean;
    sortable?: boolean;
}

export interface GridData {
    [key: string]: any;
}

// API Response types
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