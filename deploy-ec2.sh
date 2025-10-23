# Script de despliegue rápido en EC2
# Ejecuta: bash deploy-ec2.sh

#!/bin/bash

echo "🚀 Despliegue de WhatsApp Bot en EC2"
echo "===================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar si estamos en EC2
if [ ! -f /sys/hypervisor/uuid ] || [ "$(head -c 3 /sys/hypervisor/uuid)" != "ec2" ]; then
    print_warning "Este script está diseñado para ejecutarse en EC2"
fi

# 1. Actualizar sistema
echo ""
echo "📦 Actualizando sistema..."
sudo yum update -y
print_success "Sistema actualizado"

# 2. Instalar Docker
echo ""
echo "🐳 Instalando Docker..."
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker $USER
print_success "Docker instalado"

# 3. Instalar Docker Compose
echo ""
echo "🐳 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
print_success "Docker Compose instalado"

# 4. Instalar Git
echo ""
echo "📥 Instalando Git..."
sudo yum install git -y
print_success "Git instalado"

# 5. Verificar instalaciones
echo ""
echo "🔍 Verificando instalaciones..."
docker --version
docker-compose --version
git --version

# 6. Crear directorio para auth_info
echo ""
echo "📁 Creando directorios..."
mkdir -p ~/bot-wsp/auth_info
mkdir -p ~/bot-wsp/logs
print_success "Directorios creados"

# 7. Configurar auto-inicio
echo ""
echo "⚙️ Configurando auto-inicio..."
sudo bash -c 'cat > /etc/systemd/system/whatsapp-bot.service <<EOF
[Unit]
Description=WhatsApp Bot Docker Container
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/bot-wsp
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable whatsapp-bot
print_success "Auto-inicio configurado"

# 8. Instrucciones finales
echo ""
echo "========================================"
echo -e "${GREEN}✅ Instalación completada!${NC}"
echo "========================================"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Clona tu repositorio:"
echo "   cd ~/bot-wsp"
echo "   git clone https://github.com/tu-usuario/bot-wsp.git ."
echo ""
echo "2. Vincula WhatsApp (primera vez):"
echo "   docker-compose up"
echo "   (Escanea el QR con WhatsApp)"
echo "   (Presiona Ctrl+C cuando esté conectado)"
echo ""
echo "3. Ejecuta en background:"
echo "   docker-compose up -d"
echo ""
echo "4. Ver logs:"
echo "   docker-compose logs -f"
echo ""
echo "5. Reiniciar el bot:"
echo "   sudo systemctl restart whatsapp-bot"
echo ""
echo "⚠️  IMPORTANTE: Cierra sesión y vuelve a conectarte para que los cambios de grupo de Docker tomen efecto"
echo "   exit"
echo "   ssh -i tu-key.pem ec2-user@tu-ip"
echo ""
