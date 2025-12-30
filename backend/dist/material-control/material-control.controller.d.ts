import { MaterialControlService } from './material-control.service';
export declare class MaterialControlController {
    private readonly materialControlService;
    constructor(materialControlService: MaterialControlService);
    create(createDto: any, req: any): Promise<import("./schemas/material-control.schema").MaterialControl>;
    findAll(query: any): Promise<{
        data: import("./schemas/material-control.schema").MaterialControl[];
        total: number;
    }>;
    getDiscrepancies(query: any): Promise<{
        data: import("./schemas/material-control.schema").MaterialControl[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./schemas/material-control.schema").MaterialControl>;
    registerUsage(id: string, usageData: any, req: any): Promise<import("./schemas/material-control.schema").MaterialControl>;
    registerReturn(id: string, returnData: any, req: any): Promise<import("./schemas/material-control.schema").MaterialControl>;
    resolveDiscrepancy(id: string, resolutionData: any, req: any): Promise<import("./schemas/material-control.schema").MaterialControl>;
    closeControl(id: string, req: any): Promise<import("./schemas/material-control.schema").MaterialControl>;
}
