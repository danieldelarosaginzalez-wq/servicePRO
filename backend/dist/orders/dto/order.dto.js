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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImpossibilityDto = exports.FinishOrderDto = exports.MaterialUtilizadoDto = exports.MaterialSugeridoDto = exports.AssignTechnicianDto = exports.UpdateOrderDto = exports.CreateOrderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "poliza_number", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "cliente", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['instalacion', 'mantenimiento', 'reparacion', 'inspeccion']),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "tipo_trabajo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "analista_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "tecnico_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MaterialSugeridoDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "materiales_sugeridos", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "ubicacion.lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "ubicacion.lng", void 0);
class UpdateOrderDto {
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "cliente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['instalacion', 'mantenimiento', 'reparacion', 'inspeccion']),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "tipo_trabajo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['creada', 'asignada', 'en_proceso', 'finalizada', 'imposibilidad', 'pendiente_revision', 'cerrada']),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "tecnico_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MaterialSugeridoDto),
    __metadata("design:type", Array)
], UpdateOrderDto.prototype, "materiales_sugeridos", void 0);
class AssignTechnicianDto {
}
exports.AssignTechnicianDto = AssignTechnicianDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], AssignTechnicianDto.prototype, "technicianId", void 0);
class MaterialSugeridoDto {
}
exports.MaterialSugeridoDto = MaterialSugeridoDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], MaterialSugeridoDto.prototype, "material_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MaterialSugeridoDto.prototype, "cantidad", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MaterialSugeridoDto.prototype, "motivo", void 0);
class MaterialUtilizadoDto {
}
exports.MaterialUtilizadoDto = MaterialUtilizadoDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], MaterialUtilizadoDto.prototype, "material_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MaterialUtilizadoDto.prototype, "cantidad", void 0);
class FinishOrderDto {
}
exports.FinishOrderDto = FinishOrderDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MaterialUtilizadoDto),
    __metadata("design:type", Array)
], FinishOrderDto.prototype, "materiales_utilizados", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FinishOrderDto.prototype, "evidencias", void 0);
class ImpossibilityDto {
}
exports.ImpossibilityDto = ImpossibilityDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImpossibilityDto.prototype, "motivo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImpossibilityDto.prototype, "foto_tirilla", void 0);
//# sourceMappingURL=order.dto.js.map