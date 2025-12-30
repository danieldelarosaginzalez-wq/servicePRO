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
exports.VisitReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const visit_report_schema_1 = require("./schemas/visit-report.schema");
const files_service_1 = require("../files/files.service");
let VisitReportsService = class VisitReportsService {
    constructor(visitReportModel, filesService) {
        this.visitReportModel = visitReportModel;
        this.filesService = filesService;
    }
    async create(createDto, userId) {
        const numero_comprobante = await this.generateComprobanteNumber();
        const report = new this.visitReportModel({
            ...createDto,
            numero_comprobante,
            creado_por: userId,
            fecha_creacion: new Date(),
            estado: 'borrador',
        });
        return report.save();
    }
    async findAll(query = {}) {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;
        const mongoFilters = {};
        if (filters.estado)
            mongoFilters.estado = filters.estado;
        if (filters.order_id)
            mongoFilters.order_id = filters.order_id;
        if (filters.operario_id)
            mongoFilters['bloque_operativo.operario_id'] = filters.operario_id;
        const [data, total] = await Promise.all([
            this.visitReportModel
                .find(mongoFilters)
                .populate('order_id')
                .populate('creado_por', 'nombre email')
                .sort({ fecha_creacion: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .exec(),
            this.visitReportModel.countDocuments(mongoFilters),
        ]);
        return { data, total };
    }
    async findOne(id) {
        const report = await this.visitReportModel
            .findById(id)
            .populate('order_id')
            .populate('creado_por', 'nombre email')
            .exec();
        if (!report) {
            throw new common_1.NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }
        return report;
    }
    async findByOrder(orderId) {
        return this.visitReportModel
            .findOne({ order_id: orderId })
            .populate('order_id')
            .exec();
    }
    async update(id, updateDto) {
        const report = await this.visitReportModel.findById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }
        if (report.estado === 'finalizado') {
            throw new common_1.BadRequestException('No se puede modificar un comprobante finalizado');
        }
        const updated = await this.visitReportModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .populate('order_id')
            .exec();
        return updated;
    }
    async addSignature(id, signatureData) {
        const report = await this.visitReportModel.findById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }
        const firmaPath = await this.filesService.saveBase64Image(signatureData.firma_imagen, `firmas/${id}`);
        const firmaData = {
            nombre: signatureData.nombre,
            documento: signatureData.documento,
            cargo: signatureData.cargo,
            firma_imagen: firmaPath,
            fecha: new Date(),
        };
        const firmas = report.firmas || {};
        if (signatureData.tipo === 'testigo') {
            firmas.testigos = firmas.testigos || [];
            firmas.testigos.push(firmaData);
        }
        else {
            firmas[signatureData.tipo] = firmaData;
        }
        const todasFirmas = firmas.operario && firmas.usuario_suscriptor;
        const updated = await this.visitReportModel
            .findByIdAndUpdate(id, {
            firmas,
            estado: todasFirmas ? 'firmado' : 'pendiente_firma',
        }, { new: true })
            .exec();
        return updated;
    }
    async finalize(id) {
        const report = await this.visitReportModel.findById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }
        if (report.estado !== 'firmado') {
            throw new common_1.BadRequestException('El comprobante debe estar firmado para finalizarlo');
        }
        const updated = await this.visitReportModel
            .findByIdAndUpdate(id, {
            estado: 'finalizado',
            fecha_finalizacion: new Date(),
        }, { new: true })
            .exec();
        return updated;
    }
    async addEvidence(id, imageBase64) {
        const report = await this.visitReportModel.findById(id);
        if (!report) {
            throw new common_1.NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }
        const imagePath = await this.filesService.saveBase64Image(imageBase64, `comprobantes/${id}`);
        const updated = await this.visitReportModel
            .findByIdAndUpdate(id, { $push: { fotos_evidencia: imagePath } }, { new: true })
            .exec();
        return updated;
    }
    async generateComprobanteNumber() {
        const count = await this.visitReportModel.countDocuments();
        const year = new Date().getFullYear();
        return `CV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
};
exports.VisitReportsService = VisitReportsService;
exports.VisitReportsService = VisitReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(visit_report_schema_1.VisitReport.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        files_service_1.FilesService])
], VisitReportsService);
//# sourceMappingURL=visit-reports.service.js.map