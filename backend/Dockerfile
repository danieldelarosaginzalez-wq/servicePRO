# Backend Dockerfile - NestJS
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de producción
FROM node:18-alpine

RUN apk add --no-cache vips-dev

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Crear directorios de uploads con permisos correctos
RUN mkdir -p uploads/avatars uploads/comprobantes uploads/evidencias uploads/firmas uploads/general \
    && chown -R nestjs:nodejs /app

# Cambiar a usuario no-root
USER nestjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
