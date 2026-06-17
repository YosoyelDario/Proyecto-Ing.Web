# ── Etapa 1: build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar manifiesto de dependencias
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Variable de entorno para que Vite sepa dónde está el backend en producción.
# Con Docker Compose en la misma máquina, el browser del usuario accede
# al backend por localhost:3000 (puerto mapeado al host).
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Compilar la aplicación (tsc + vite build → dist/)
RUN npm run build

# ── Etapa 2: servidor nginx ───────────────────────────────────────────────────
FROM nginx:alpine

# Copiar el build generado por Vite al directorio que sirve nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx adaptada a React Router (SPA)
# Sin esto, cualquier ruta distinta de "/" devuelve 404 al recargar la página.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]