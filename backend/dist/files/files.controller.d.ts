import { Response } from 'express';
import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        success: boolean;
        data: {
            path: string;
            filename: string;
            size: number;
        };
    }>;
    uploadMultipleFiles(files: Express.Multer.File[], folder?: string): Promise<{
        success: boolean;
        data: {
            path: string;
            filename: string;
            size: number;
        }[];
    }>;
    uploadBase64(image: string, folder?: string): Promise<{
        success: boolean;
        data: {
            path: string;
        };
    }>;
    getFile(folder: string, filename: string, res: Response): Promise<void>;
    deleteFile(folder: string, filename: string): Promise<{
        success: boolean;
    }>;
}
