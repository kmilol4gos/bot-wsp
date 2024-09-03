# Usa una imagen oficial de Node.js
FROM node:22

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente
COPY . .

# Expone el puerto si es necesario
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "src/index.js"]
