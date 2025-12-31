# Frontend Dockerfile - React con Nginx
# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos
COPY --from=builder /app/build /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
