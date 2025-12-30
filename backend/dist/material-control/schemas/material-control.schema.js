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
exports.MaterialControlSchema = exports.MaterialControl = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MaterialControl = class MaterialControl {
};
exports.MaterialControl = MaterialControl;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MaterialControl.prototype, "tecnico_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Order' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MaterialControl.prototype, "orden_trabajo_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], MaterialControl.prototype, "materiales_asignados", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'asignado',
        enum: ['asignado', 'en_trabajo', 'trabajo_completado', 'devolucion_pendiente', 'devolucion_completada', 'cerrado', 'entregado_masivo']
    }),
    __metadata("design:type", String)
], MaterialControl.prototype, "estado_general", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MaterialControl.prototype, "bodeguero_asigno", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MaterialControl.prototype, "analista_supervisa", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], MaterialControl.prototype, "tiene_descuadre", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], MaterialControl.prototype, "valor_descuadre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], MaterialControl.prototype, "descuadre_resuelto", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MaterialControl.prototype, "motivo_descuadre", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MaterialControl.prototype, "resolucion_descuadre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MaterialControl.prototype, "resuelto_por", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], MaterialControl.prototype, "fecha_resolucion", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], MaterialControl.prototype, "fecha_creacion", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], MaterialControl.prototype, "fecha_cierre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], MaterialControl.prototype, "historial", void 0);
exports.MaterialControl = MaterialControl = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], MaterialControl);
exports.MaterialControlSchema = mongoose_1.SchemaFactory.createForClass(MaterialControl);
exports.MaterialControlSchema.index({ tecnico_id: 1 });
exports.MaterialControlSchema.index({ orden_trabajo_id: 1 });
exports.MaterialControlSchema.index({ estado_general: 1 });
exports.MaterialControlSchema.index({ tiene_descuadre: 1 });
//# sourceMappingURL=material-control.schema.js.map