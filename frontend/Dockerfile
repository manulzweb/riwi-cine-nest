# ==========================================================
# ETAPA 1: Construcción (Build)
# ==========================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación frontend (TypeScript + Vite)
RUN npm run build

# ==========================================================
# ETAPA 2: Producción con Nginx
# ==========================================================
FROM nginx:1.27-alpine AS runner

# Copiar configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar bundle estático generado
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
