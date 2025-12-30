export declare class FilesService {
    private readonly uploadDir;
    constructor();
    private ensureUploadDirs;
    saveFile(file: Express.Multer.File, folder?: string): Promise<string>;
    saveBase64Image(base64Data: string, folder?: string): Promise<string>;
    private optimizeAndSaveImage;
    getFilePath(relativePath: string): string;
    deleteFile(relativePath: string): boolean;
    saveSignature(signatureData: string, orderId: string, type: string): Promise<string>;
}
