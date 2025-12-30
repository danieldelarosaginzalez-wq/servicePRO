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
exports.MaterialsController = void 0;
const common_1 = require("@nestjs/common");
const materials_service_1 = require("./materials.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MaterialsController = class MaterialsController {
    constructor(materialsService) {
        this.materialsService = materialsService;
    }
    create(createMaterialDto, req) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new common_1.ForbiddenException('No tienes permisos para crear materiales');
        }
        return this.materialsService.create(createMaterialDto);
    }
    findAll(query) {
        return this.materialsService.findAll(query);
    }
    getMyInventory() {
        return {
            success: true,
            data: {
                materials: [
                    {
                        material_id: '1',
                        material: { nombre: 'Tubería PVC 4"', codigo: 'TUB001', unidad_medida: 'metro' },
                        cantidad_actual: 50,
                        cantidad_apartada: 10,
                        cantidad_disponible: 40,
                        ultimo_movimiento: new Date(),
                    },
                    {
                        material_id: '2',
                        material: { nombre: 'Codo PVC 4"', codigo: 'COD001', unidad_medida: 'unidad' },
                        cantidad_actual: 25,
                        cantidad_apartada: 5,
                        cantidad_disponible: 20,
                        ultimo_movimiento: new Date(),
                    },
                ],
            },
        };
    }
    findOne(id) {
        return this.materialsService.findOne(id);
    }
    update(id, updateMaterialDto, req) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new common_1.ForbiddenException('No tienes permisos para actualizar materiales');
        }
        return this.materialsService.update(id, updateMaterialDto);
    }
    remove(id, req) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar materiales');
        }
        return this.materialsService.remove(id);
    }
    assignToTechnician(assignDto, req) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new common_1.ForbiddenException('No tienes permisos para asignar materiales');
        }
        return { success: true, message: 'Materiales asignados correctamente' };
    }
};
exports.MaterialsController = MaterialsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-inventory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getMyInventory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('assign-to-technician'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "assignToTechnician", null);
exports.MaterialsController = MaterialsController = __decorate([
    (0, common_1.Controller)('materials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [materials_service_1.MaterialsService])
], MaterialsController);
//# sourceMappingURL=materials.controller.js.map