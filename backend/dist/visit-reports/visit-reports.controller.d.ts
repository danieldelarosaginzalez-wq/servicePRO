import { VisitReportsService } from './visit-reports.service';
export declare class VisitReportsController {
    private readonly visitReportsService;
    constructor(visitReportsService: VisitReportsService);
    create(createDto: any, req: any): Promise<import("./schemas/visit-report.schema").VisitReport>;
    findAll(query: any): Promise<{
        data: import("./schemas/visit-report.schema").VisitReport[];
        total: number;
    }>;
    findByOrder(orderId: string): Promise<import("./schemas/visit-report.schema").VisitReport>;
    findOne(id: string): Promise<import("./schemas/visit-report.schema").VisitReport>;
    update(id: string, updateDto: any): Promise<import("./schemas/visit-report.schema").VisitReport>;
    addSignature(id: string, signatureData: any): Promise<import("./schemas/visit-report.schema").VisitReport>;
    addEvidence(id: string, image: string): Promise<import("./schemas/visit-report.schema").VisitReport>;
    finalize(id: string): Promise<import("./schemas/visit-report.schema").VisitReport>;
}
