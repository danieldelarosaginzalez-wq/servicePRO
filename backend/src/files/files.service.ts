import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class FilesService {
    private readonly uploadDir = join(process.cwd(), 'uploads');

    constructor() {
        this.ensureUploadDirs();
    }

    private ensureUploadDirs() {
        const folders = ['general', 'evidencias', 'firmas', 'comprobantes', 'avatars'];
        folders.forEach(folder => {
            const path = join(this.uploadDir, folder);
            if (!existsSync(path)) {
                mkdirSync(path, { recursive: true });
            }
        });
    }

    async saveFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
        const folderPath = join(this.uploadDir, folder);
        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }

        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extname(file.originalname)}`;
        const filePath = join(folderPath, filename);

        // Si es imagen, optimizar
        if (file.mimetype.startsWith('image/')) {
            await this.optimizeAndSaveImage(file.buffer || readFileSync(file.path), filePath);
        } else {
            writeFileSync(filePath, file.buffer || readFileSync(file.path));
        }

        return `/uploads/${folder}/${filename}`;
    }

    async saveBase64Image(base64Data: string, folder: string = 'evidencias'): Promise<string> {
        const folderPath = join(this.uploadDir, folder);
        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }

        // Extraer datos del base64
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Formato base64 inválido');
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const filePath = join(folderPath, filename);

        await this.optimizeAndSaveImage(buffer, filePath);

        return `/uploads/${folder}/${filename}`;
    }

    private async optimizeAndSaveImage(buffer: Buffer, outputPath: string): Promise<void> {
        try {
            await sharp(buffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(outputPath.replace(/\.\w+$/, '.jpg'));
        } catch (error) {
            // Si sharp falla, guardar sin optimizar
            writeFileSync(outputPath, buffer);
        }
    }

    getFilePath(relativePath: string): string {
        const fullPath = join(process.cwd(), relativePath);
        if (!existsSync(fullPath)) {
            throw new NotFoundException('Archivo no encontrado');
        }
        return fullPath;
    }

    deleteFile(relativePath: string): boolean {
        try {
            const fullPath = join(process.cwd(), relativePath);
            if (existsSync(fullPath)) {
                unlinkSync(fullPath);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    async saveSignature(signatureData: string, orderId: string, type: string): Promise<string> {
        return this.saveBase64Image(signatureData, `firmas/${orderId}`);
    }
}
