import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
    // Crear app SIN bodyParser automático para configurarlo manualmente
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bodyParser: false, // Desactivar para configurar manualmente
    });

    // Configurar límites de payload ANTES que cualquier otro middleware
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

    // Crear directorio de uploads si no existe
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
    }

    // Servir archivos estáticos desde /uploads
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });

    // Configurar CORS
    app.enableCors({
        origin: true, // Permitir cualquier origen en producción
        credentials: true,
    });

    // Configurar validación global
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // Prefijo global para API
    app.setGlobalPrefix('api');

    // Health check endpoint (sin prefijo /api)
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/health', (req: any, res: any) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 ServiceOps Pro Backend running on port ${port}`);
    console.log('📸 Configurado para manejar payloads hasta 50MB');
    console.log('📁 Archivos estáticos servidos desde /uploads');
    console.log('💚 Health check disponible en /health');
}

bootstrap();