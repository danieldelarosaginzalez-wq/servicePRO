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
exports.VisitReportSchema = exports.VisitReport = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let VisitReport = class VisitReport {
};
exports.VisitReport = VisitReport;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Order', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], VisitReport.prototype, "order_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], VisitReport.prototype, "numero_comprobante", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], VisitReport.prototype, "identificacion_servicio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], VisitReport.prototype, "bloque_operativo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], VisitReport.prototype, "trabajo_realizado", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], VisitReport.prototype, "firmas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], VisitReport.prototype, "fotos_evidencia", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'borrador', enum: ['borrador', 'pendiente_firma', 'firmado', 'finalizado'] }),
    __metadata("design:type", String)
], VisitReport.prototype, "estado", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], VisitReport.prototype, "pdf_generado", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], VisitReport.prototype, "creado_por", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], VisitReport.prototype, "fecha_creacion", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], VisitReport.prototype, "fecha_finalizacion", void 0);
exports.VisitReport = VisitReport = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], VisitReport);
exports.VisitReportSchema = mongoose_1.SchemaFactory.createForClass(VisitReport);
exports.VisitReportSchema.index({ order_id: 1 });
exports.VisitReportSchema.index({ numero_comprobante: 1 }, { unique: true });
exports.VisitReportSchema.index({ estado: 1 });
exports.VisitReportSchema.index({ 'bloque_operativo.operario_id': 1 });
//# sourceMappingURL=visit-report.schema.js.map