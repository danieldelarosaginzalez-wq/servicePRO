import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { MaterialDocument } from '../materials/schemas/material.schema';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
export interface TechnicianInventoryItem {
    material_id: string;
    material: {
        nombre: string;
        codigo: string;
        unidad_medida: string;
    };
    cantidad_actual: number;
    cantidad_apartada: number;
    cantidad_disponible: number;
    ultimo_movimiento: Date;
}
export interface InventoryMovement {
    _id?: string;
    tecnico_id: string;
    material_id: string;
    tipo: 'asignacion' | 'consumo' | 'devolucion' | 'ajuste';
    cantidad: number;
    cantidad_anterior: number;
    cantidad_nueva: number;
    motivo: string;
    fecha: Date;
    asignado_por?: string;
    material?: {
        nombre: string;
        codigo: string;
        unidad_medida: string;
    };
}
export declare class InventoryService {
    private userModel;
    private materialModel;
    private wsGateway;
    private technicianInventories;
    private inventoryMovements;
    constructor(userModel: Model<UserDocument>, materialModel: Model<MaterialDocument>, wsGateway: WebSocketGatewayService);
    getTechnicianInventory(technicianId: string): Promise<{
        success: boolean;
        data: {
            tecnico: {
                _id: import("mongoose").Types.ObjectId;
                nombre: string;
                email: string;
            };
            materials: TechnicianInventoryItem[];
            total_items: number;
            total_value: number;
        };
    }>;
    initTechnicianInventory(technicianId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            tecnico: {
                _id: import("mongoose").Types.ObjectId;
                nombre: string;
                email: string;
            };
            materials: any[];
        };
    }>;
    getTechnicianMovements(technicianId: string): Promise<{
        success: boolean;
        data: InventoryMovement[];
        total: number;
    }>;
    assignMaterialsToTechnician(technicianId: string, assignData: any, assignedBy: string): Promise<{
        success: boolean;
        message: string;
        data: {
            tecnico: {
                _id: import("mongoose").Types.ObjectId;
                nombre: string;
                email: string;
            };
            materials_assigned: any;
            total_quantity: any;
        };
    }>;
    consumeMaterials(technicianId: string, materialsConsumed: any[], orderId: string, assignedBy: string): Promise<{
        success: boolean;
        message: string;
        data: {
            materials_consumed: number;
            total_quantity: number;
            tecnico?: undefined;
        };
    } | {
        success: boolean;
        message: string;
        data: {
            tecnico: {
                _id: import("mongoose").Types.ObjectId;
                nombre: string;
                email: string;
            };
            materials_consumed: number;
            total_quantity: any;
        };
    }>;
}
