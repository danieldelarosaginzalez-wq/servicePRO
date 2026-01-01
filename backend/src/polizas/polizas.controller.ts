import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PolizasService } from './polizas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('polizas')
@UseGuards(JwtAuthGuard)
export class PolizasController {
    constructor(private readonly polizasService: PolizasService) { }

    @Post()
    create(@Body() createPolizaDto: any) {
        return this.polizasService.create(createPolizaDto);
    }

    @Get()
    findAll(@Query() query: any) {
        // Usar el nuevo método que incluye conteo de órdenes
        return this.polizasService.findAllWithOrderCount(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.polizasService.findOne(id);
    }

    @Get(':id/orders-count')
    async getOrdersCount(@Param('id') id: string) {
        const poliza = await this.polizasService.findOne(id);
        const count = await this.polizasService.countOrdersByPoliza(poliza.poliza_number);
        return { count };
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePolizaDto: any) {
        return this.polizasService.update(id, updatePolizaDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.polizasService.remove(id);
    }
}