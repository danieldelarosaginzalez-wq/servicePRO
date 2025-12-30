import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, AssignTechnicianDto, FinishOrderDto, ImpossibilityDto } from './dto/order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<import("./schemas/order.schema").Order>;
    findAll(query: any): Promise<{
        data: import("./schemas/order.schema").Order[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./schemas/order.schema").Order>;
    update(id: string, updateOrderDto: UpdateOrderDto, req: any): Promise<import("./schemas/order.schema").Order>;
    assignTechnician(id: string, assignDto: AssignTechnicianDto, req: any): Promise<import("./schemas/order.schema").Order>;
    startOrder(id: string, req: any): Promise<import("./schemas/order.schema").Order>;
    finishOrder(id: string, finishDto: FinishOrderDto, req: any): Promise<import("./schemas/order.schema").Order>;
    updateWorkProgress(id: string, progressData: any, req: any): Promise<import("./schemas/order.schema").Order>;
    reportImpossibility(id: string, impossibilityDto: ImpossibilityDto, req: any): Promise<import("./schemas/order.schema").Order>;
}
