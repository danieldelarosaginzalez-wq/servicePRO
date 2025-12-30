import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';

@Injectable()
export class MaterialsService {
    constructor(
        @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    ) { }

    async create(createMaterialDto: any): Promise<Material> {
        const createdMaterial = new this.materialModel(createMaterialDto);
        return createdMaterial.save();
    }

    async findAll(query: any = {}): Promise<{ data: Material[]; total: number }> {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;

        const mongoFilters: any = {};

        if (filters.estado) {
            mongoFilters.estado = filters.estado;
        }

        if (filters.categoria) {
            mongoFilters.categoria = filters.categoria;
        }

        if (filters.nombre) {
            mongoFilters.nombre = { $regex: filters.nombre, $options: 'i' };
        }

        const [data, total] = await Promise.all([
            this.materialModel
                .find(mongoFilters)
                .sort({ nombre: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.materialModel.countDocuments(mongoFilters),
        ]);

        return { data, total };
    }

    async findOne(id: string): Promise<Material> {
        const material = await this.materialModel.findById(id).exec();
        if (!material) {
            throw new NotFoundException(`Material con ID ${id} no encontrado`);
        }
        return material;
    }

    async update(id: string, updateMaterialDto: any): Promise<Material> {
        const updatedMaterial = await this.materialModel
            .findByIdAndUpdate(id, updateMaterialDto, { new: true })
            .exec();

        if (!updatedMaterial) {
            throw new NotFoundException(`Material con ID ${id} no encontrado`);
        }

        return updatedMaterial;
    }

    async remove(id: string): Promise<void> {
        const result = await this.materialModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Material con ID ${id} no encontrado`);
        }
    }
}