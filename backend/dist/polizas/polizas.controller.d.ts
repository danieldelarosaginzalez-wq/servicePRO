import { PolizasService } from './polizas.service';
export declare class PolizasController {
    private readonly polizasService;
    constructor(polizasService: PolizasService);
    create(createPolizaDto: any): Promise<import("./schemas/poliza.schema").Poliza>;
    findAll(query: any): Promise<{
        data: import("./schemas/poliza.schema").Poliza[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./schemas/poliza.schema").Poliza>;
    update(id: string, updatePolizaDto: any): Promise<import("./schemas/poliza.schema").Poliza>;
    remove(id: string): Promise<void>;
}
