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
exports.OrderSchema = exports.Order = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Order.prototype, "codigo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Order.prototype, "poliza_number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Order.prototype, "cliente", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Order.prototype, "direccion", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['instalacion', 'mantenimiento', 'reparacion', 'inspeccion']
    }),
    __metadata("design:type", String)
], Order.prototype, "tipo_trabajo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "analista_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "tecnico_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['creada', 'asignada', 'en_proceso', 'finalizada', 'imposibilidad', 'pendiente_revision', 'cerrada'],
        default: 'creada'
    }),
    __metadata("design:type", String)
], Order.prototype, "estado", void 0);
__decorate([
    (0, mongoose_1.Prop)([{
            material_id: { type: mongoose_2.Types.ObjectId, ref: 'Material' },
            cantidad: Number,
            motivo: String,
        }]),
    __metadata("design:type", Array)
], Order.prototype, "materiales_sugeridos", void 0);
__decorate([
    (0, mongoose_1.Prop)([{
            material_id: { type: mongoose_2.Types.ObjectId, ref: 'Material' },
            cantidad: Number,
            fecha_apartado: Date,
        }]),
    __metadata("design:type", Array)
], Order.prototype, "materiales_apartados", void 0);
__decorate([
    (0, mongoose_1.Prop)([{
            material_id: { type: mongoose_2.Types.ObjectId, ref: 'Material' },
            cantidad: Number,
            fecha_uso: Date,
        }]),
    __metadata("design:type", Array)
], Order.prototype, "materiales_utilizados", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            foto_inicial: String,
            foto_durante: [String],
            foto_materiales: [String],
            foto_final: String,
            fases_completadas: [String],
        }
    }),
    __metadata("design:type", Object)
], Order.prototype, "evidencias", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            motivo: String,
            foto_tirilla: String,
            fecha: Date,
        }
    }),
    __metadata("design:type", Object)
], Order.prototype, "imposibilidad", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        }
    }),
    __metadata("design:type", Object)
], Order.prototype, "ubicacion", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Order.prototype, "fecha_asignacion", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Order.prototype, "fecha_inicio", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Order.prototype, "fecha_finalizacion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Order.prototype, "fecha_creacion", void 0);
exports.Order = Order = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Order);
exports.OrderSchema = mongoose_1.SchemaFactory.createForClass(Order);
//# sourceMappingURL=order.schema.js.map