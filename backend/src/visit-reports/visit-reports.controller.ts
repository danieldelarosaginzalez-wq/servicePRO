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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VisitReportsService } from './visit-reports.service';

@Controller('visit-reports')
@UseGuards(JwtAuthGuard)
export class VisitReportsController {
    constructor(private readonly visitReportsService: VisitReportsService) { }

    @Post()
    create(@Body() createDto: any, @Request() req: any) {
        return this.visitReportsService.create(createDto, req.user._id);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.visitReportsService.findAll(query);
    }

    @Get('by-order/:orderId')
    findByOrder(@Param('orderId') orderId: string) {
        return this.visitReportsService.findByOrder(orderId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.visitReportsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.visitReportsService.update(id, updateDto);
    }

    @Post(':id/signature')
    addSignature(@Param('id') id: string, @Body() signatureData: any) {
        return this.visitReportsService.addSignature(id, signatureData);
    }

    @Post(':id/evidence')
    addEvidence(@Param('id') id: string, @Body('image') image: string) {
        return this.visitReportsService.addEvidence(id, image);
    }

    @Post(':id/finalize')
    finalize(@Param('id') id: string) {
        return this.visitReportsService.finalize(id);
    }
}
