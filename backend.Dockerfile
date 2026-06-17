# ── Etapa única: producción ──────────────────────────────────────────────────
FROM node:24-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar manifiesto de dependencias primero (aprovecha caché de Docker)
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código fuente
COPY . .

# El puerto que expone el backend (debe coincidir con PORT en .env)
EXPOSE 3000

# Comando de inicio (usa "start", no "dev", para no depender de nodemon)
CMD ["node", "index.js"]