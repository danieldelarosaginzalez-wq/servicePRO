import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventario')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('mi-inventario')
    async getMyInventory(@Request() req: any) {
        // El técnico puede ver su propio inventario
        const userId = req.user._id?.toString() || req.user._id;
        return this.inventoryService.getTechnicianInventory(userId);
    }

    @Get('tecnico/:technicianId')
    async getTechnicianInventory(@Param('technicianId') technicianId: string, @Request() req: any) {
        // Solo analista_inventario_oculto puede ver inventario de otros técnicos
        const userId = req.user._id?.toString() || req.user._id;
        if (req.user.rol !== 'analista_inventario_oculto' && userId !== technicianId) {
            throw new ForbiddenException('No tienes permisos para ver este inventario');
        }
        return this.inventoryService.getTechnicianInventory(technicianId);
    }

    @Post('tecnico/:technicianId/init')
    async initTechnicianInventory(@Param('technicianId') technicianId: string, @Request() req: any) {
        // Solo analista_inventario_oculto puede inicializar inventario
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para inicializar inventario');
        }
        return this.inventoryService.initTechnicianInventory(technicianId);
    }

    @Get('tecnico/:technicianId/movimientos')
    async getTechnicianMovements(@Param('technicianId') technicianId: string, @Request() req: any) {
        // Solo analista_inventario_oculto puede ver movimientos de otros técnicos
        const userId = req.user._id?.toString() || req.user._id;
        if (req.user.rol !== 'analista_inventario_oculto' && userId !== technicianId) {
            throw new ForbiddenException('No tienes permisos para ver estos movimientos');
        }
        return this.inventoryService.getTechnicianMovements(technicianId);
    }

    @Post('tecnico/:technicianId/assign')
    async assignMaterialsToTechnician(
        @Param('technicianId') technicianId: string,
        @Body() assignData: any,
        @Request() req: any
    ) {
        // Solo analista_inventario_oculto puede asignar materiales
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para asignar materiales');
        }
        return this.inventoryService.assignMaterialsToTechnician(technicianId, assignData, req.user._id);
    }

    @Post('tecnico/:technicianId/consume')
    async consumeMaterials(
        @Param('technicianId') technicianId: string,
        @Body() consumeData: any,
        @Request() req: any
    ) {
        console.log('📦 Consume materials request:', {
            technicianId,
            userId: req.user._id?.toString(),
            userRol: req.user.rol,
            consumeData
        });

        // Solo el técnico puede consumir sus propios materiales o analista_inventario_oculto
        const userId = req.user._id?.toString() || req.user._id;
        if (req.user.rol !== 'analista_inventario_oculto' && userId !== technicianId) {
            throw new ForbiddenException('No tienes permisos para consumir estos materiales');
        }
        return this.inventoryService.consumeMaterials(
            technicianId,
            consumeData?.materials || [],
            consumeData?.order_id || '',
            userId
        );
    }
}