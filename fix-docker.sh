#!/bin/bash

echo "🔧 Solucionando problemas de Docker en AWS..."
echo "================================================"

# Detener contenedores
echo ""
echo "⏹️  Paso 1: Deteniendo contenedores existentes..."
sudo docker-compose down 2>/dev/null || true
echo "✅ Contenedores detenidos"

# Limpiar Docker
echo ""
echo "🧹 Paso 2: Limpiando caché de Docker..."
sudo docker system prune -af --volumes
echo "✅ Caché limpiado"

# Verificar package-lock.json
echo ""
echo "📦 Paso 3: Verificando package-lock.json..."
if [ ! -f "package-lock.json" ]; then
    echo "⚠️  package-lock.json no encontrado, generando..."
    npm install
    echo "✅ package-lock.json generado"
else
    echo "✅ package-lock.json encontrado"
fi

# Verificar auth_info
echo ""
echo "🔐 Paso 4: Verificando auth_info..."
if [ ! -d "auth_info" ] || [ ! -f "auth_info/creds.json" ]; then
    echo "⚠️  ADVERTENCIA: auth_info no encontrado o incompleto"
    echo "   Necesitas copiar auth_info desde tu computadora local:"
    echo "   scp -i tu-key.pem -r auth_info ubuntu@tu-ip:~/bot-wsp/"
else
    echo "✅ auth_info encontrado"
    ls -la auth_info/ | head -5
fi

# Crear directorios necesarios
echo ""
echo "📁 Paso 5: Creando directorios necesarios..."
mkdir -p logs
echo "✅ Directorios creados"

# Reconstruir imagen
echo ""
echo "🏗️  Paso 6: Reconstruyendo imagen Docker (esto puede tardar)..."
sudo docker-compose build --no-cache
echo "✅ Imagen reconstruida"

# Iniciar contenedor
echo ""
echo "🚀 Paso 7: Iniciando bot en background..."
sudo docker-compose up -d
echo "✅ Bot iniciado"

# Esperar un momento
echo ""
echo "⏳ Esperando 5 segundos para que el bot inicie..."
sleep 5

# Verificar estado
echo ""
echo "📊 Estado del contenedor:"
sudo docker-compose ps

# Mostrar logs
echo ""
echo "================================================"
echo "📋 Últimas líneas de los logs:"
echo "================================================"
sudo docker-compose logs --tail=20

echo ""
echo "================================================"
echo "✅ ¡Proceso completado!"
echo "================================================"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs en tiempo real:  sudo docker-compose logs -f"
echo "   Detener bot:              sudo docker-compose down"
echo "   Reiniciar bot:            sudo docker-compose restart"
echo "   Ver estado:               sudo docker-compose ps"
echo ""
