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
exports.MaterialControlService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const material_control_schema_1 = require("./schemas/material-control.schema");
const inventory_service_1 = require("../inventory/inventory.service");
let MaterialControlService = class MaterialControlService {
    constructor(materialControlModel, inventoryService) {
        this.materialControlModel = materialControlModel;
        this.inventoryService = inventoryService;
    }
    async create(createDto, userId) {
        const control = new this.materialControlModel({
            ...createDto,
            bodeguero_asigno: userId,
            fecha_creacion: new Date(),
            estado_general: 'asignado',
            historial: [{
                    accion: 'creacion',
                    usuario_id: new mongoose_2.Types.ObjectId(userId),
                    fecha: new Date(),
                    detalles: { materiales: createDto.materiales_asignados }
                }]
        });
        return control.save();
    }
    async findAll(query = {}) {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;
        const mongoFilters = {};
        if (filters.tecnico_id)
            mongoFilters.tecnico_id = filters.tecnico_id;
        if (filters.estado_general)
            mongoFilters.estado_general = filters.estado_general;
        if (filters.tiene_descuadre !== undefined)
            mongoFilters.tiene_descuadre = filters.tiene_descuadre === 'true';
        if (filters.orden_trabajo_id)
            mongoFilters.orden_trabajo_id = filters.orden_trabajo_id;
        const [data, total] = await Promise.all([
            this.materialControlModel
                .find(mongoFilters)
                .populate('tecnico_id', 'nombre email')
                .populate('bodeguero_asigno', 'nombre email')
                .populate('orden_trabajo_id', 'codigo estado')
                .sort({ fecha_creacion: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.materialControlModel.countDocuments(mongoFilters),
        ]);
        return { data, total };
    }
    async findOne(id) {
        const control = await this.materialControlModel
            .findById(id)
            .populate('tecnico_id', 'nombre email')
            .populate('bodeguero_asigno', 'nombre email')
            .populate('orden_trabajo_id')
            .exec();
        if (!control) {
            throw new common_1.NotFoundException(`Control de material con ID ${id} no encontrado`);
        }
        return control;
    }
    async getDiscrepancies(query = {}) {
        return this.findAll({ ...query, tiene_descuadre: 'true' });
    }
    async registerUsage(id, usageData, userId) {
        const control = await this.materialControlModel.findById(id);
        if (!control) {
            throw new common_1.NotFoundException(`Control de material con ID ${id} no encontrado`);
        }
        const materialIndex = control.materiales_asignados.findIndex(m => m.material_id.toString() === usageData.material_id);
        if (materialIndex === -1) {
            throw new common_1.BadRequestException('Material no encontrado en este control');
        }
        const material = control.materiales_asignados[materialIndex];
        const disponible = material.cantidad_asignada - material.cantidad_utilizada - material.cantidad_devuelta;
        if (usageData.cantidad_utilizada > disponible) {
            throw new common_1.BadRequestException(`Solo hay ${disponible} unidades disponibles`);
        }
        material.cantidad_utilizada += usageData.cantidad_utilizada;
        material.estado = 'en_uso';
        control.historial.push({
            accion: 'uso_material',
            usuario_id: new mongoose_2.Types.ObjectId(userId),
            fecha: new Date(),
            detalles: usageData
        });
        control.estado_general = 'en_trabajo';
        return control.save();
    }
    async registerReturn(id, returnData, userId) {
        const control = await this.materialControlModel.findById(id);
        if (!control) {
            throw new common_1.NotFoundException(`Control de material con ID ${id} no encontrado`);
        }
        const materialIndex = control.materiales_asignados.findIndex(m => m.material_id.toString() === returnData.material_id);
        if (materialIndex === -1) {
            throw new common_1.BadRequestException('Material no encontrado en este control');
        }
        const material = control.materiales_asignados[materialIndex];
        material.cantidad_devuelta += returnData.cantidad_devuelta;
        material.cantidad_perdida += returnData.cantidad_perdida || 0;
        const totalContabilizado = material.cantidad_utilizada + material.cantidad_devuelta + material.cantidad_perdida;
        if (totalContabilizado !== material.cantidad_asignada) {
            control.tiene_descuadre = true;
            control.valor_descuadre = material.cantidad_asignada - totalContabilizado;
            control.motivo_descuadre = returnData.motivo_perdida || 'Descuadre sin justificar';
        }
        if (material.cantidad_devuelta === material.cantidad_asignada - material.cantidad_utilizada) {
            material.estado = 'devuelto_total';
        }
        else if (material.cantidad_devuelta > 0) {
            material.estado = 'devuelto_parcial';
        }
        control.historial.push({
            accion: 'devolucion_material',
            usuario_id: new mongoose_2.Types.ObjectId(userId),
            fecha: new Date(),
            detalles: returnData
        });
        const todosDevueltos = control.materiales_asignados.every(m => m.estado === 'devuelto_total' || m.estado === 'completado');
        if (todosDevueltos) {
            control.estado_general = control.tiene_descuadre ? 'devolucion_pendiente' : 'devolucion_completada';
        }
        return control.save();
    }
    async resolveDiscrepancy(id, resolutionData, userId) {
        const control = await this.materialControlModel.findById(id);
        if (!control) {
            throw new common_1.NotFoundException(`Control de material con ID ${id} no encontrado`);
        }
        if (!control.tiene_descuadre) {
            throw new common_1.BadRequestException('Este control no tiene descuadre');
        }
        control.descuadre_resuelto = true;
        control.resolucion_descuadre = resolutionData.resolucion;
        control.resuelto_por = new mongoose_2.Types.ObjectId(userId);
        control.fecha_resolucion = new Date();
        control.estado_general = 'cerrado';
        control.fecha_cierre = new Date();
        control.historial.push({
            accion: 'resolucion_descuadre',
            usuario_id: new mongoose_2.Types.ObjectId(userId),
            fecha: new Date(),
            detalles: resolutionData
        });
        return control.save();
    }
    async closeControl(id, userId) {
        const control = await this.materialControlModel.findById(id);
        if (!control) {
            throw new common_1.NotFoundException(`Control de material con ID ${id} no encontrado`);
        }
        if (control.tiene_descuadre && !control.descuadre_resuelto) {
            throw new common_1.BadRequestException('No se puede cerrar un control con descuadre sin resolver');
        }
        control.estado_general = 'cerrado';
        control.fecha_cierre = new Date();
        control.historial.push({
            accion: 'cierre',
            usuario_id: new mongoose_2.Types.ObjectId(userId),
            fecha: new Date()
        });
        return control.save();
    }
};
exports.MaterialControlService = MaterialControlService;
exports.MaterialControlService = MaterialControlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(material_control_schema_1.MaterialControl.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        inventory_service_1.InventoryService])
], MaterialControlService);
//# sourceMappingURL=material-control.service.js.map