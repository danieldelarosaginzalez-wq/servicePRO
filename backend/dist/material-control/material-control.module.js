"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialControlModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const material_control_controller_1 = require("./material-control.controller");
const material_control_service_1 = require("./material-control.service");
const material_control_schema_1 = require("./schemas/material-control.schema");
const inventory_module_1 = require("../inventory/inventory.module");
const notifications_module_1 = require("../notifications/notifications.module");
const websocket_module_1 = require("../websocket/websocket.module");
let MaterialControlModule = class MaterialControlModule {
};
exports.MaterialControlModule = MaterialControlModule;
exports.MaterialControlModule = MaterialControlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: material_control_schema_1.MaterialControl.name, schema: material_control_schema_1.MaterialControlSchema }
            ]),
            inventory_module_1.InventoryModule,
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
            websocket_module_1.WebSocketModule,
        ],
        controllers: [material_control_controller_1.MaterialControlController],
        providers: [material_control_service_1.MaterialControlService],
        exports: [material_control_service_1.MaterialControlService],
    })
], MaterialControlModule);
//# sourceMappingURL=material-control.module.js.map