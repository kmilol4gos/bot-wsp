# Usa una imagen oficial de Node.js con soporte UTF-8
FROM node:20-alpine

# Instalar paquetes necesarios para producción
RUN apk add --no-cache \
    bash \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Configurar variables de entorno para UTF-8
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    TERM=xterm-256color \
    NODE_ENV=production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias (solo producción)
RUN npm install --omit=dev && \
    npm cache clean --force

# Copia el código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorios necesarios con permisos correctos
RUN mkdir -p auth_info logs && \
    chown -R nodejs:nodejs /usr/src/app

# Cambiar a usuario no-root
USER nodejs

# Health check para verificar que el contenedor esté funcionando
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "console.log('Health check OK')" || exit 1

# Expone el puerto si usas el servidor HTTP
EXPOSE 3000

# Comando para ejecutar la aplicación con supervisor
CMD ["node", "src/supervisor.js"]
