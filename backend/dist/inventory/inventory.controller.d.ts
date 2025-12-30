import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getMyInventory(req: any): Promise<{
        success: boolean;
        data: {
            tecnico: {
                _id: import("mongoose").Types.ObjectId;
                nombre: string;
                email: string;
            };
            materials: import("./inventory.service").TechnicianInventoryItem[];
            total_items: number;
            total_value: number;
        };
    }>;
    getTechnicianInventory(technicianId: string, req: any): Promise<{
        success: boolean;
        data: {
            tecnico: {
                _id: import("mongoose").Types.ObjectId;
                nombre: string;
                email: string;
            };
            materials: import("./inventory.service").TechnicianInventoryItem[];
            total_items: number;
            total_value: number;
        };
    }>;
    initTechnicianInventory(technicianId: string, req: any): Promise<{
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
    getTechnicianMovements(technicianId: string, req: any): Promise<{
        success: boolean;
        data: import("./inventory.service").InventoryMovement[];
        total: number;
    }>;
    assignMaterialsToTechnician(technicianId: string, assignData: any, req: any): Promise<{
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
    consumeMaterials(technicianId: string, consumeData: any, req: any): Promise<{
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
