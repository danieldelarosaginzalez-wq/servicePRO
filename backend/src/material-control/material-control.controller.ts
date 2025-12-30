import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MaterialControlService } from './material-control.service';

@Controller('material-control')
@UseGuards(JwtAuthGuard)
export class MaterialControlController {
    constructor(private readonly materialControlService: MaterialControlService) { }

    @Post()
    create(@Body() createDto: any, @Request() req: any) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para crear controles de material');
        }
        return this.materialControlService.create(createDto, req.user._id);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.materialControlService.findAll(query);
    }

    @Get('discrepancies')
    getDiscrepancies(@Query() query: any) {
        return this.materialControlService.getDiscrepancies(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.materialControlService.findOne(id);
    }

    @Post(':id/usage')
    registerUsage(@Param('id') id: string, @Body() usageData: any, @Request() req: any) {
        return this.materialControlService.registerUsage(id, usageData, req.user._id);
    }

    @Post(':id/return')
    registerReturn(@Param('id') id: string, @Body() returnData: any, @Request() req: any) {
        return this.materialControlService.registerReturn(id, returnData, req.user._id);
    }

    @Post(':id/resolve-discrepancy')
    resolveDiscrepancy(@Param('id') id: string, @Body() resolutionData: any, @Request() req: any) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para resolver descuadres');
        }
        return this.materialControlService.resolveDiscrepancy(id, resolutionData, req.user._id);
    }

    @Post(':id/close')
    closeControl(@Param('id') id: string, @Request() req: any) {
        if (req.user.rol !== 'analista_inventario_oculto') {
            throw new ForbiddenException('No tienes permisos para cerrar controles');
        }
        return this.materialControlService.closeControl(id, req.user._id);
    }
}
