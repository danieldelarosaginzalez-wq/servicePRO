"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const files_controller_1 = require("./files.controller");
const files_service_1 = require("./files.service");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        const folder = req.body?.folder || 'general';
                        const uploadPath = (0, path_1.join)(process.cwd(), 'uploads', folder);
                        cb(null, uploadPath);
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
                    },
                }),
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
                fileFilter: (req, file, cb) => {
                    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                    if (allowedMimes.includes(file.mimetype)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('Tipo de archivo no permitido'), false);
                    }
                },
            }),
        ],
        controllers: [files_controller_1.FilesController],
        providers: [files_service_1.FilesService],
        exports: [files_service_1.FilesService],
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map