import { MaterialsService } from './materials.service';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    create(createMaterialDto: any, req: any): Promise<import("./schemas/material.schema").Material>;
    findAll(query: any): Promise<{
        data: import("./schemas/material.schema").Material[];
        total: number;
    }>;
    getMyInventory(): {
        success: boolean;
        data: {
            materials: {
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
            }[];
        };
    };
    findOne(id: string): Promise<import("./schemas/material.schema").Material>;
    update(id: string, updateMaterialDto: any, req: any): Promise<import("./schemas/material.schema").Material>;
    remove(id: string, req: any): Promise<void>;
    assignToTechnician(assignDto: any, req: any): {
        success: boolean;
        message: string;
    };
}
