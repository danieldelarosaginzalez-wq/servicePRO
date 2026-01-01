import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
    constructor(private readonly materialsService: MaterialsService) { }

    @Post()
    create(@Body() createMaterialDto: any, @Request() req: any) {
        // Solo analista_inventario_oculto puede crear materiales
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para crear materiales');
        }
        return this.materialsService.create(createMaterialDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.materialsService.findAll(query);
    }

    @Get('stats/dashboard')
    getStats() {
        return this.materialsService.getStats();
    }

    @Get('my-inventory')
    getMyInventory() {
        // Simulación de inventario del técnico
        return {
            success: true,
            data: {
                materials: [
                    {
                        material_id: '1',
                        material: { nombre: 'Tubería PVC 4"', codigo: 'TUB001', unidad_medida: 'metro' },
                        cantidad_actual: 50,
                        cantidad_apartada: 10,
                        cantidad_disponible: 40,
                        ultimo_movimiento: new Date(),
                    },
                    {
                        material_id: '2',
                        material: { nombre: 'Codo PVC 4"', codigo: 'COD001', unidad_medida: 'unidad' },
                        cantidad_actual: 25,
                        cantidad_apartada: 5,
                        cantidad_disponible: 20,
                        ultimo_movimiento: new Date(),
                    },
                ],
            },
        };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.materialsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMaterialDto: any, @Request() req: any) {
        // Solo analista_inventario_oculto puede actualizar materiales
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para actualizar materiales');
        }
        return this.materialsService.update(id, updateMaterialDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        // Solo analista_inventario_oculto puede eliminar materiales
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para eliminar materiales');
        }
        return this.materialsService.remove(id);
    }

    @Post('assign-to-technician')
    assignToTechnician(@Body() assignDto: any, @Request() req: any) {
        // Solo analista_inventario_oculto puede asignar materiales
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para asignar materiales');
        }
        return { success: true, message: 'Materiales asignados correctamente' };
    }
}