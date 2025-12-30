"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitReportsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const visit_reports_controller_1 = require("./visit-reports.controller");
const visit_reports_service_1 = require("./visit-reports.service");
const visit_report_schema_1 = require("./schemas/visit-report.schema");
const files_module_1 = require("../files/files.module");
let VisitReportsModule = class VisitReportsModule {
};
exports.VisitReportsModule = VisitReportsModule;
exports.VisitReportsModule = VisitReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: visit_report_schema_1.VisitReport.name, schema: visit_report_schema_1.VisitReportSchema }
            ]),
            files_module_1.FilesModule,
        ],
        controllers: [visit_reports_controller_1.VisitReportsController],
        providers: [visit_reports_service_1.VisitReportsService],
        exports: [visit_reports_service_1.VisitReportsService],
    })
], VisitReportsModule);
//# sourceMappingURL=visit-reports.module.js.map