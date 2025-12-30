import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { PolizaDocument } from '../polizas/schemas/poliza.schema';
import { CreateOrderDto, UpdateOrderDto, AssignTechnicianDto } from './dto/order.dto';
export declare class OrdersService {
    private orderModel;
    private polizaModel;
    constructor(orderModel: Model<OrderDocument>, polizaModel: Model<PolizaDocument>);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(query?: any): Promise<{
        data: Order[];
        total: number;
    }>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    assignTechnician(id: string, assignDto: AssignTechnicianDto): Promise<Order>;
    startOrder(id: string, userId: string): Promise<Order>;
    finishOrder(id: string, userId: string, finishData: any): Promise<Order>;
    reportImpossibility(id: string, userId: string, impossibilityData: any): Promise<Order>;
    updateWorkProgress(id: string, userId: string, progressData: any): Promise<Order>;
    private generateOrderCode;
}
