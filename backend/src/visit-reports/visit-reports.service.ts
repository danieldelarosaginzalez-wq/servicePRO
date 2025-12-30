import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VisitReport, VisitReportDocument } from './schemas/visit-report.schema';
import { FilesService } from '../files/files.service';

@Injectable()
export class VisitReportsService {
    constructor(
        @InjectModel(VisitReport.name) private visitReportModel: Model<VisitReportDocument>,
        private filesService: FilesService,
    ) { }

    async create(createDto: any, userId: string): Promise<VisitReport> {
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

    async findAll(query: any = {}): Promise<{ data: VisitReport[]; total: number }> {
        const { page = 1, limit = 50, ...filters } = query;
        const skip = (page - 1) * limit;

        const mongoFilters: any = {};

        if (filters.estado) mongoFilters.estado = filters.estado;
        if (filters.order_id) mongoFilters.order_id = filters.order_id;
        if (filters.operario_id) mongoFilters['bloque_operativo.operario_id'] = filters.operario_id;

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

    async findOne(id: string): Promise<VisitReport> {
        const report = await this.visitReportModel
            .findById(id)
            .populate('order_id')
            .populate('creado_por', 'nombre email')
            .exec();

        if (!report) {
            throw new NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }

        return report;
    }

    async findByOrder(orderId: string): Promise<VisitReport | null> {
        return this.visitReportModel
            .findOne({ order_id: orderId })
            .populate('order_id')
            .exec();
    }

    async update(id: string, updateDto: any): Promise<VisitReport> {
        const report = await this.visitReportModel.findById(id);

        if (!report) {
            throw new NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }

        if (report.estado === 'finalizado') {
            throw new BadRequestException('No se puede modificar un comprobante finalizado');
        }

        const updated = await this.visitReportModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .populate('order_id')
            .exec();

        return updated;
    }

    async addSignature(id: string, signatureData: {
        tipo: 'funcionario' | 'operario' | 'usuario_suscriptor' | 'testigo';
        nombre: string;
        documento?: string;
        cargo?: string;
        firma_imagen: string;
    }): Promise<VisitReport> {
        const report = await this.visitReportModel.findById(id);

        if (!report) {
            throw new NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }

        // Guardar imagen de firma
        const firmaPath = await this.filesService.saveBase64Image(
            signatureData.firma_imagen,
            `firmas/${id}`
        );

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
        } else {
            firmas[signatureData.tipo] = firmaData;
        }

        // Verificar si todas las firmas requeridas están completas
        const todasFirmas = firmas.operario && firmas.usuario_suscriptor;

        const updated = await this.visitReportModel
            .findByIdAndUpdate(
                id,
                {
                    firmas,
                    estado: todasFirmas ? 'firmado' : 'pendiente_firma',
                },
                { new: true }
            )
            .exec();

        return updated;
    }

    async finalize(id: string): Promise<VisitReport> {
        const report = await this.visitReportModel.findById(id);

        if (!report) {
            throw new NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }

        if (report.estado !== 'firmado') {
            throw new BadRequestException('El comprobante debe estar firmado para finalizarlo');
        }

        const updated = await this.visitReportModel
            .findByIdAndUpdate(
                id,
                {
                    estado: 'finalizado',
                    fecha_finalizacion: new Date(),
                },
                { new: true }
            )
            .exec();

        return updated;
    }

    async addEvidence(id: string, imageBase64: string): Promise<VisitReport> {
        const report = await this.visitReportModel.findById(id);

        if (!report) {
            throw new NotFoundException(`Comprobante con ID ${id} no encontrado`);
        }

        const imagePath = await this.filesService.saveBase64Image(
            imageBase64,
            `comprobantes/${id}`
        );

        const updated = await this.visitReportModel
            .findByIdAndUpdate(
                id,
                { $push: { fotos_evidencia: imagePath } },
                { new: true }
            )
            .exec();

        return updated;
    }

    private async generateComprobanteNumber(): Promise<string> {
        const count = await this.visitReportModel.countDocuments();
        const year = new Date().getFullYear();
        return `CV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
}
