import { Model } from 'mongoose';
import { VisitReport, VisitReportDocument } from './schemas/visit-report.schema';
import { FilesService } from '../files/files.service';
export declare class VisitReportsService {
    private visitReportModel;
    private filesService;
    constructor(visitReportModel: Model<VisitReportDocument>, filesService: FilesService);
    create(createDto: any, userId: string): Promise<VisitReport>;
    findAll(query?: any): Promise<{
        data: VisitReport[];
        total: number;
    }>;
    findOne(id: string): Promise<VisitReport>;
    findByOrder(orderId: string): Promise<VisitReport | null>;
    update(id: string, updateDto: any): Promise<VisitReport>;
    addSignature(id: string, signatureData: {
        tipo: 'funcionario' | 'operario' | 'usuario_suscriptor' | 'testigo';
        nombre: string;
        documento?: string;
        cargo?: string;
        firma_imagen: string;
    }): Promise<VisitReport>;
    finalize(id: string): Promise<VisitReport>;
    addEvidence(id: string, imageBase64: string): Promise<VisitReport>;
    private generateComprobanteNumber;
}
