import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Res,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder: string = 'general'
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        const path = await this.filesService.saveFile(file, folder);
        return {
            success: true,
            data: { path, filename: file.originalname, size: file.size }
        };
    }

    @Post('upload-multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultipleFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('folder') folder: string = 'general'
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No se proporcionaron archivos');
        }

        const results = await Promise.all(
            files.map(file => this.filesService.saveFile(file, folder))
        );

        return {
            success: true,
            data: results.map((path, i) => ({
                path,
                filename: files[i].originalname,
                size: files[i].size
            }))
        };
    }

    @Post('upload-base64')
    async uploadBase64(
        @Body('image') image: string,
        @Body('folder') folder: string = 'evidencias'
    ) {
        if (!image) {
            throw new BadRequestException('No se proporcionó imagen');
        }

        const path = await this.filesService.saveBase64Image(image, folder);
        return { success: true, data: { path } };
    }

    @Get(':folder/:filename')
    async getFile(
        @Param('folder') folder: string,
        @Param('filename') filename: string,
        @Res() res: Response
    ) {
        const filePath = this.filesService.getFilePath(`uploads/${folder}/${filename}`);
        return res.sendFile(filePath);
    }

    @Delete(':folder/:filename')
    async deleteFile(
        @Param('folder') folder: string,
        @Param('filename') filename: string
    ) {
        const deleted = this.filesService.deleteFile(`uploads/${folder}/${filename}`);
        return { success: deleted };
    }
}
