"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs_1 = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: false,
    });
    const express = require('express');
    app.use(express.json({
        limit: '50mb',
        parameterLimit: 100000,
        extended: true
    }));
    app.use(express.urlencoded({
        limit: '50mb',
        extended: true,
        parameterLimit: 100000
    }));
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(uploadsDir)) {
        (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
    }
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    await app.listen(3001);
    console.log('🚀 ServiceOps Pro Backend running on http://localhost:3001');
    console.log('📸 Configurado para manejar payloads hasta 50MB');
    console.log('📁 Archivos estáticos servidos desde /uploads');
}
bootstrap();
//# sourceMappingURL=main.js.map