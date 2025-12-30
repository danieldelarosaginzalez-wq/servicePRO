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
exports.PolizasService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const poliza_schema_1 = require("./schemas/poliza.schema");
let PolizasService = class PolizasService {
    constructor(polizaModel) {
        this.polizaModel = polizaModel;
    }
    async create(createPolizaDto) {
        const createdPoliza = new this.polizaModel(createPolizaDto);
        return createdPoliza.save();
    }
    async findAll(query = {}) {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;
        const mongoFilters = {};
        if (filters.estado) {
            mongoFilters.estado = filters.estado;
        }
        if (filters.cliente) {
            mongoFilters.cliente = { $regex: filters.cliente, $options: 'i' };
        }
        const [data, total] = await Promise.all([
            this.polizaModel
                .find(mongoFilters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.polizaModel.countDocuments(mongoFilters),
        ]);
        return { data, total };
    }
    async findOne(id) {
        const poliza = await this.polizaModel.findById(id).exec();
        if (!poliza) {
            throw new common_1.NotFoundException(`Póliza con ID ${id} no encontrada`);
        }
        return poliza;
    }
    async update(id, updatePolizaDto) {
        const updatedPoliza = await this.polizaModel
            .findByIdAndUpdate(id, updatePolizaDto, { new: true })
            .exec();
        if (!updatedPoliza) {
            throw new common_1.NotFoundException(`Póliza con ID ${id} no encontrada`);
        }
        return updatedPoliza;
    }
    async remove(id) {
        const result = await this.polizaModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Póliza con ID ${id} no encontrada`);
        }
    }
};
exports.PolizasService = PolizasService;
exports.PolizasService = PolizasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(poliza_schema_1.Poliza.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PolizasService);
//# sourceMappingURL=polizas.service.js.map