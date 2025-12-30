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
        origin: ['http://localhost:3000', 'http://localhost:3001'],
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

    await app.listen(3001);
    console.log('🚀 ServiceOps Pro Backend running on http://localhost:3001');
    console.log('📸 Configurado para manejar payloads hasta 50MB');
    console.log('📁 Archivos estáticos servidos desde /uploads');
}
bootstrap();