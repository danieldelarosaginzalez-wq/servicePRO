import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitReportsController } from './visit-reports.controller';
import { VisitReportsService } from './visit-reports.service';
import { VisitReport, VisitReportSchema } from './schemas/visit-report.schema';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: VisitReport.name, schema: VisitReportSchema }
        ]),
        FilesModule,
    ],
    controllers: [VisitReportsController],
    providers: [VisitReportsService],
    exports: [VisitReportsService],
})
export class VisitReportsModule { }
