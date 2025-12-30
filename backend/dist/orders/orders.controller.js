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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const order_dto_1 = require("./dto/order.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    create(createOrderDto, req) {
        if (req.user.rol !== 'analista') {
            throw new common_1.ForbiddenException('No tienes permisos para crear órdenes de trabajo');
        }
        createOrderDto.analista_id = req.user._id;
        return this.ordersService.create(createOrderDto);
    }
    findAll(query) {
        return this.ordersService.findAll(query);
    }
    findOne(id) {
        return this.ordersService.findOne(id);
    }
    update(id, updateOrderDto, req) {
        if (req.user.rol !== 'analista') {
            throw new common_1.ForbiddenException('No tienes permisos para actualizar órdenes');
        }
        return this.ordersService.update(id, updateOrderDto);
    }
    assignTechnician(id, assignDto, req) {
        if (req.user.rol !== 'analista') {
            throw new common_1.ForbiddenException('No tienes permisos para asignar técnicos a órdenes');
        }
        return this.ordersService.assignTechnician(id, assignDto);
    }
    startOrder(id, req) {
        return this.ordersService.startOrder(id, req.user._id);
    }
    finishOrder(id, finishDto, req) {
        return this.ordersService.finishOrder(id, req.user._id, finishDto);
    }
    updateWorkProgress(id, progressData, req) {
        const userId = req.user._id?.toString() || req.user._id;
        console.log('📦 Progress endpoint - userId:', userId, 'orderId:', id);
        return this.ordersService.updateWorkProgress(id, userId, progressData);
    }
    reportImpossibility(id, impossibilityDto, req) {
        return this.ordersService.reportImpossibility(id, req.user._id, impossibilityDto);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.UpdateOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign-technician'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.AssignTechnicianDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "assignTechnician", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "startOrder", null);
__decorate([
    (0, common_1.Post)(':id/finish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.FinishOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "finishOrder", null);
__decorate([
    (0, common_1.Post)(':id/progress'),
    (0, common_1.UseInterceptors)((0, platform_express_1.NoFilesInterceptor)()),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateWorkProgress", null);
__decorate([
    (0, common_1.Post)(':id/impossibility'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.ImpossibilityDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "reportImpossibility", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map