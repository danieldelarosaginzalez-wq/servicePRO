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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getMyInventory(req) {
        const userId = req.user._id?.toString() || req.user._id;
        return this.inventoryService.getTechnicianInventory(userId);
    }
    async getTechnicianInventory(technicianId, req) {
        const userId = req.user._id?.toString() || req.user._id;
        if (req.user.rol !== 'analista_inventario_oculto' && userId !== technicianId) {
            throw new common_1.ForbiddenException('No tienes permisos para ver este inventario');
        }
        return this.inventoryService.getTechnicianInventory(technicianId);
    }
    async initTechnicianInventory(technicianId, req) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new common_1.ForbiddenException('No tienes permisos para inicializar inventario');
        }
        return this.inventoryService.initTechnicianInventory(technicianId);
    }
    async getTechnicianMovements(technicianId, req) {
        const userId = req.user._id?.toString() || req.user._id;
        if (req.user.rol !== 'analista_inventario_oculto' && userId !== technicianId) {
            throw new common_1.ForbiddenException('No tienes permisos para ver estos movimientos');
        }
        return this.inventoryService.getTechnicianMovements(technicianId);
    }
    async assignMaterialsToTechnician(technicianId, assignData, req) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new common_1.ForbiddenException('No tienes permisos para asignar materiales');
        }
        return this.inventoryService.assignMaterialsToTechnician(technicianId, assignData, req.user._id);
    }
    async consumeMaterials(technicianId, consumeData, req) {
        console.log('📦 Consume materials request:', {
            technicianId,
            userId: req.user._id?.toString(),
            userRol: req.user.rol,
            consumeData
        });
        const userId = req.user._id?.toString() || req.user._id;
        if (req.user.rol !== 'analista_inventario_oculto' && userId !== technicianId) {
            throw new common_1.ForbiddenException('No tienes permisos para consumir estos materiales');
        }
        return this.inventoryService.consumeMaterials(technicianId, consumeData?.materials || [], consumeData?.order_id || '', userId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('mi-inventario'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getMyInventory", null);
__decorate([
    (0, common_1.Get)('tecnico/:technicianId'),
    __param(0, (0, common_1.Param)('technicianId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getTechnicianInventory", null);
__decorate([
    (0, common_1.Post)('tecnico/:technicianId/init'),
    __param(0, (0, common_1.Param)('technicianId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "initTechnicianInventory", null);
__decorate([
    (0, common_1.Get)('tecnico/:technicianId/movimientos'),
    __param(0, (0, common_1.Param)('technicianId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getTechnicianMovements", null);
__decorate([
    (0, common_1.Post)('tecnico/:technicianId/assign'),
    __param(0, (0, common_1.Param)('technicianId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "assignMaterialsToTechnician", null);
__decorate([
    (0, common_1.Post)('tecnico/:technicianId/consume'),
    __param(0, (0, common_1.Param)('technicianId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "consumeMaterials", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventario'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map