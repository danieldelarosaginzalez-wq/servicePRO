import { Model } from 'mongoose';
import { Poliza, PolizaDocument } from './schemas/poliza.schema';
export declare class PolizasService {
    private polizaModel;
    constructor(polizaModel: Model<PolizaDocument>);
    create(createPolizaDto: any): Promise<Poliza>;
    findAll(query?: any): Promise<{
        data: Poliza[];
        total: number;
    }>;
    findOne(id: string): Promise<Poliza>;
    update(id: string, updatePolizaDto: any): Promise<Poliza>;
    remove(id: string): Promise<void>;
}
