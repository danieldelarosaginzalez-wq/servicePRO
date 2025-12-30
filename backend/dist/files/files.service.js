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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const sharp = require("sharp");
let FilesService = class FilesService {
    constructor() {
        this.uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
        this.ensureUploadDirs();
    }
    ensureUploadDirs() {
        const folders = ['general', 'evidencias', 'firmas', 'comprobantes', 'avatars'];
        folders.forEach(folder => {
            const path = (0, path_1.join)(this.uploadDir, folder);
            if (!(0, fs_1.existsSync)(path)) {
                (0, fs_1.mkdirSync)(path, { recursive: true });
            }
        });
    }
    async saveFile(file, folder = 'general') {
        const folderPath = (0, path_1.join)(this.uploadDir, folder);
        if (!(0, fs_1.existsSync)(folderPath)) {
            (0, fs_1.mkdirSync)(folderPath, { recursive: true });
        }
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${(0, path_1.extname)(file.originalname)}`;
        const filePath = (0, path_1.join)(folderPath, filename);
        if (file.mimetype.startsWith('image/')) {
            await this.optimizeAndSaveImage(file.buffer || (0, fs_1.readFileSync)(file.path), filePath);
        }
        else {
            (0, fs_1.writeFileSync)(filePath, file.buffer || (0, fs_1.readFileSync)(file.path));
        }
        return `/uploads/${folder}/${filename}`;
    }
    async saveBase64Image(base64Data, folder = 'evidencias') {
        const folderPath = (0, path_1.join)(this.uploadDir, folder);
        if (!(0, fs_1.existsSync)(folderPath)) {
            (0, fs_1.mkdirSync)(folderPath, { recursive: true });
        }
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Formato base64 inválido');
        }
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const filePath = (0, path_1.join)(folderPath, filename);
        await this.optimizeAndSaveImage(buffer, filePath);
        return `/uploads/${folder}/${filename}`;
    }
    async optimizeAndSaveImage(buffer, outputPath) {
        try {
            await sharp(buffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(outputPath.replace(/\.\w+$/, '.jpg'));
        }
        catch (error) {
            (0, fs_1.writeFileSync)(outputPath, buffer);
        }
    }
    getFilePath(relativePath) {
        const fullPath = (0, path_1.join)(process.cwd(), relativePath);
        if (!(0, fs_1.existsSync)(fullPath)) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        return fullPath;
    }
    deleteFile(relativePath) {
        try {
            const fullPath = (0, path_1.join)(process.cwd(), relativePath);
            if ((0, fs_1.existsSync)(fullPath)) {
                (0, fs_1.unlinkSync)(fullPath);
                return true;
            }
            return false;
        }
        catch {
            return false;
        }
    }
    async saveSignature(signatureData, orderId, type) {
        return this.saveBase64Image(signatureData, `firmas/${orderId}`);
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FilesService);
//# sourceMappingURL=files.service.js.map