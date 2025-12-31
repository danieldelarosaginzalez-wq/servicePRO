# Frontend Dockerfile - React con Nginx
FROM node:18-alpine AS builder

WORKDIR /app

# Argumento para la URL del API (se pasa durante el build)
ARG REACT_APP_API_URL=https://servicepro.sliplane.app/api

# Establecer como variable de entorno para el build
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install --legacy-peer-deps && npm cache clean --force

COPY . .
RUN npm run build

FROM nginx:alpine

# Configuración de nginx
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
