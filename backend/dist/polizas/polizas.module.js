"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolizasModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const polizas_controller_1 = require("./polizas.controller");
const polizas_service_1 = require("./polizas.service");
const poliza_schema_1 = require("./schemas/poliza.schema");
let PolizasModule = class PolizasModule {
};
exports.PolizasModule = PolizasModule;
exports.PolizasModule = PolizasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: poliza_schema_1.Poliza.name, schema: poliza_schema_1.PolizaSchema }]),
        ],
        controllers: [polizas_controller_1.PolizasController],
        providers: [polizas_service_1.PolizasService],
        exports: [polizas_service_1.PolizasService],
    })
], PolizasModule);
//# sourceMappingURL=polizas.module.js.map