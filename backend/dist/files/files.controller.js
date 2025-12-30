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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const files_service_1 = require("./files.service");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadFile(file, folder = 'general') {
        if (!file) {
            throw new common_1.BadRequestException('No se proporcionó ningún archivo');
        }
        const path = await this.filesService.saveFile(file, folder);
        return {
            success: true,
            data: { path, filename: file.originalname, size: file.size }
        };
    }
    async uploadMultipleFiles(files, folder = 'general') {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No se proporcionaron archivos');
        }
        const results = await Promise.all(files.map(file => this.filesService.saveFile(file, folder)));
        return {
            success: true,
            data: results.map((path, i) => ({
                path,
                filename: files[i].originalname,
                size: files[i].size
            }))
        };
    }
    async uploadBase64(image, folder = 'evidencias') {
        if (!image) {
            throw new common_1.BadRequestException('No se proporcionó imagen');
        }
        const path = await this.filesService.saveBase64Image(image, folder);
        return { success: true, data: { path } };
    }
    async getFile(folder, filename, res) {
        const filePath = this.filesService.getFilePath(`uploads/${folder}/${filename}`);
        return res.sendFile(filePath);
    }
    async deleteFile(folder, filename) {
        const deleted = this.filesService.deleteFile(`uploads/${folder}/${filename}`);
        return { success: deleted };
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Post)('upload-base64'),
    __param(0, (0, common_1.Body)('image')),
    __param(1, (0, common_1.Body)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadBase64", null);
__decorate([
    (0, common_1.Get)(':folder/:filename'),
    __param(0, (0, common_1.Param)('folder')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFile", null);
__decorate([
    (0, common_1.Delete)(':folder/:filename'),
    __param(0, (0, common_1.Param)('folder')),
    __param(1, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map