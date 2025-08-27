# Usa una imagen oficial de Node.js con soporte UTF-8
FROM node:20-alpine

# Instalar paquetes necesarios para UTF-8
RUN apk add --no-cache \
    bash \
    && rm -rf /var/cache/apk/*

# Configurar variables de entorno para UTF-8
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    TERM=xterm-256color

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Instala qrcode-terminal específicamente
RUN npm install qrcode-terminal

# Copia el código fuente
COPY . .

# Expone el puerto si es necesario
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "src/index.js"]
