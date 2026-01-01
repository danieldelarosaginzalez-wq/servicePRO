import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ForbiddenException, UseInterceptors } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, AssignTechnicianDto, FinishOrderDto, ImpossibilityDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NoFilesInterceptor } from '@nestjs/platform-express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
        // Solo analistas pueden crear órdenes
        if (req.user.rol !== 'analista') {
            throw new ForbiddenException('No tienes permisos para crear órdenes de trabajo');
        }

        // Asignar el analista que crea la orden
        createOrderDto.analista_id = req.user._id;

        return this.ordersService.create(createOrderDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.ordersService.findAll(query);
    }

    @Get('stats/dashboard')
    getStats(@Query() query: any) {
        return this.ordersService.getStats(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req: any) {
        // Solo analistas pueden actualizar órdenes
        if (req.user.rol !== 'analista') {
            throw new ForbiddenException('No tienes permisos para actualizar órdenes');
        }
        return this.ordersService.update(id, updateOrderDto);
    }

    @Post(':id/assign-technician')
    assignTechnician(@Param('id') id: string, @Body() assignDto: AssignTechnicianDto, @Request() req: any) {
        // Solo analistas pueden asignar técnicos
        if (req.user.rol !== 'analista') {
            throw new ForbiddenException('No tienes permisos para asignar técnicos a órdenes');
        }
        return this.ordersService.assignTechnician(id, assignDto);
    }

    @Post(':id/start')
    startOrder(@Param('id') id: string, @Request() req: any) {
        return this.ordersService.startOrder(id, req.user._id);
    }

    @Post(':id/finish')
    finishOrder(@Param('id') id: string, @Body() finishDto: FinishOrderDto, @Request() req: any) {
        return this.ordersService.finishOrder(id, req.user._id, finishDto);
    }

    @Post(':id/progress')
    @UseInterceptors(NoFilesInterceptor())
    updateWorkProgress(@Param('id') id: string, @Body() progressData: any, @Request() req: any) {
        const userId = req.user._id?.toString() || req.user._id;
        console.log('📦 Progress endpoint - userId:', userId, 'orderId:', id);
        return this.ordersService.updateWorkProgress(id, userId, progressData);
    }

    @Post(':id/impossibility')
    reportImpossibility(@Param('id') id: string, @Body() impossibilityDto: ImpossibilityDto, @Request() req: any) {
        return this.ordersService.reportImpossibility(id, req.user._id, impossibilityDto);
    }
}