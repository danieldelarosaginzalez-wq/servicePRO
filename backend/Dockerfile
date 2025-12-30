# Backend Dockerfile - NestJS
FROM node:18-alpine AS builder

# Instalar dependencias para sharp (procesamiento de imágenes)
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

RUN apk add --no-cache vips-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Crear directorio de uploads
RUN mkdir -p uploads/avatars uploads/comprobantes uploads/evidencias uploads/firmas uploads/general

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicio
CMD ["node", "dist/main.js"]
