import { Model } from 'mongoose';
import { MaterialControl, MaterialControlDocument } from './schemas/material-control.schema';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';
export declare class MaterialControlService {
    private materialControlModel;
    private inventoryService;
    private notificationsService;
    private wsGateway;
    constructor(materialControlModel: Model<MaterialControlDocument>, inventoryService: InventoryService, notificationsService: NotificationsService, wsGateway: WebSocketGatewayService);
    create(createDto: any, userId: string): Promise<MaterialControl>;
    findAll(query?: any): Promise<{
        data: MaterialControl[];
        total: number;
    }>;
    findOne(id: string): Promise<MaterialControl>;
    getDiscrepancies(query?: any): Promise<{
        data: MaterialControl[];
        total: number;
    }>;
    registerUsage(id: string, usageData: {
        material_id: string;
        cantidad_utilizada: number;
    }, userId: string): Promise<MaterialControl>;
    registerReturn(id: string, returnData: {
        material_id: string;
        cantidad_devuelta: number;
        cantidad_perdida?: number;
        motivo_perdida?: string;
    }, userId: string): Promise<MaterialControl>;
    resolveDiscrepancy(id: string, resolutionData: {
        resolucion: string;
        ajuste_inventario?: boolean;
    }, userId: string): Promise<MaterialControl>;
    closeControl(id: string, userId: string): Promise<MaterialControl>;
}
