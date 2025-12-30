import { Model } from 'mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';
export declare class MaterialsService {
    private materialModel;
    constructor(materialModel: Model<MaterialDocument>);
    create(createMaterialDto: any): Promise<Material>;
    findAll(query?: any): Promise<{
        data: Material[];
        total: number;
    }>;
    findOne(id: string): Promise<Material>;
    update(id: string, updateMaterialDto: any): Promise<Material>;
    remove(id: string): Promise<void>;
}
