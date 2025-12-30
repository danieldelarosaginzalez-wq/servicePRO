"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const material_schema_1 = require("./schemas/material.schema");
let MaterialsService = class MaterialsService {
    constructor(materialModel) {
        this.materialModel = materialModel;
    }
    async create(createMaterialDto) {
        const createdMaterial = new this.materialModel(createMaterialDto);
        return createdMaterial.save();
    }
    async findAll(query = {}) {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;
        const mongoFilters = {};
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
    async findOne(id) {
        const material = await this.materialModel.findById(id).exec();
        if (!material) {
            throw new common_1.NotFoundException(`Material con ID ${id} no encontrado`);
        }
        return material;
    }
    async update(id, updateMaterialDto) {
        const updatedMaterial = await this.materialModel
            .findByIdAndUpdate(id, updateMaterialDto, { new: true })
            .exec();
        if (!updatedMaterial) {
            throw new common_1.NotFoundException(`Material con ID ${id} no encontrado`);
        }
        return updatedMaterial;
    }
    async remove(id) {
        const result = await this.materialModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Material con ID ${id} no encontrado`);
        }
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(material_schema_1.Material.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map