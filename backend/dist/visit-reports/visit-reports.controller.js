"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitReportsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const visit_reports_service_1 = require("./visit-reports.service");
let VisitReportsController = class VisitReportsController {
    constructor(visitReportsService) {
        this.visitReportsService = visitReportsService;
    }
    create(createDto, req) {
        return this.visitReportsService.create(createDto, req.user._id);
    }
    findAll(query) {
        return this.visitReportsService.findAll(query);
    }
    findByOrder(orderId) {
        return this.visitReportsService.findByOrder(orderId);
    }
    findOne(id) {
        return this.visitReportsService.findOne(id);
    }
    update(id, updateDto) {
        return this.visitReportsService.update(id, updateDto);
    }
    addSignature(id, signatureData) {
        return this.visitReportsService.addSignature(id, signatureData);
    }
    addEvidence(id, image) {
        return this.visitReportsService.addEvidence(id, image);
    }
    finalize(id) {
        return this.visitReportsService.finalize(id);
    }
};
exports.VisitReportsController = VisitReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-order/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "findByOrder", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/signature'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "addSignature", null);
__decorate([
    (0, common_1.Post)(':id/evidence'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('image')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "addEvidence", null);
__decorate([
    (0, common_1.Post)(':id/finalize'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisitReportsController.prototype, "finalize", null);
exports.VisitReportsController = VisitReportsController = __decorate([
    (0, common_1.Controller)('visit-reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [visit_reports_service_1.VisitReportsService])
], VisitReportsController);
//# sourceMappingURL=visit-reports.controller.js.map