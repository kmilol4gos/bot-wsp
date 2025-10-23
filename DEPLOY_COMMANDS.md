# 🚀 Comandos para Ejecutar en AWS

## 📋 Pasos para Desplegar y Ejecutar

### 1. Subir archivos a AWS

En tu **computadora local**:

```bash
# Generar package-lock.json si no existe
npm install

# Crear archivo comprimido con todo el proyecto
tar -czf bot-wsp.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='logs' \
  .

# Subir a AWS
scp -i "tu-key.pem" bot-wsp.tar.gz ubuntu@tu-ip:~/

# Subir solo los archivos esenciales (alternativa más rápida)
scp -i "tu-key.pem" Dockerfile docker-compose.yml fix-docker.sh package*.json ubuntu@tu-ip:~/bot-wsp/
scp -i "tu-key.pem" -r src ubuntu@tu-ip:~/bot-wsp/
scp -i "tu-key.pem" -r auth_info ubuntu@tu-ip:~/bot-wsp/
```

### 2. Conectarte a AWS

```bash
ssh -i "tu-key.pem" ubuntu@tu-ip
```

### 3. Preparar el proyecto (si usaste tar.gz)

```bash
# Descomprimir
tar -xzf bot-wsp.tar.gz -C bot-wsp/
cd bot-wsp

# Dar permisos al script
chmod +x fix-docker.sh
```

### 4. Ejecutar el script de solución

```bash
# Este script hace todo automáticamente
./fix-docker.sh
```

**O ejecuta los comandos manualmente:**

```bash
# Detener contenedores
sudo docker-compose down

# Limpiar caché
sudo docker system prune -af

# Construir imagen
sudo docker-compose build --no-cache

# Iniciar bot
sudo docker-compose up -d

# Ver logs
sudo docker-compose logs -f
```

## 🔍 Verificar que funciona

```bash
# Ver estado
sudo docker-compose ps

# Ver logs en tiempo real
sudo docker-compose logs -f

# Deberías ver:
# ✅ Conectado exitosamente a WhatsApp
# 🚀 Bot iniciado correctamente
# 📱 Esperando mensajes...
```

## 📱 Probar el bot

Envía un mensaje de WhatsApp a tu número con:
- `hola` → Ver menú
- `1` → Horarios
- `2` → Chequeo visual

## 🔧 Comandos útiles

```bash
# Ver logs
sudo docker-compose logs -f
sudo docker-compose logs --tail=100

# Reiniciar
sudo docker-compose restart

# Detener
sudo docker-compose down

# Ver estado del contenedor
sudo docker-compose ps
sudo docker stats

# Ver uso de recursos
free -m
df -h

# Actualizar el bot
git pull  # si usas git
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

## 🆘 Troubleshooting

### Error: Cannot find module

```bash
# Reinstalar dependencias
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### Bot se desconecta

```bash
# Verificar auth_info
ls -la auth_info/

# Debe contener creds.json
# Si no existe, cópialo desde tu PC
```

### Ver errores detallados

```bash
# Logs completos
sudo docker-compose logs

# Entrar al contenedor
sudo docker exec -it whatsapp-bot sh

# Ver archivos dentro del contenedor
sudo docker exec -it whatsapp-bot ls -la auth_info/
```

## 🔄 Auto-inicio con systemd

Si quieres que el bot inicie automáticamente al reiniciar el servidor:

```bash
# Crear servicio
sudo nano /etc/systemd/system/whatsapp-bot.service
```

Pega esto:

```ini
[Unit]
Description=WhatsApp Bot
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/bot-wsp
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Luego:

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar auto-inicio
sudo systemctl enable whatsapp-bot

# Iniciar servicio
sudo systemctl start whatsapp-bot

# Ver estado
sudo systemctl status whatsapp-bot
```

## 📊 Monitoreo

```bash
# Ver uso de recursos en tiempo real
docker stats

# Ver logs del sistema
sudo journalctl -u whatsapp-bot -f

# Ver espacio en disco
df -h

# Ver memoria
free -m
```

---

**¡Listo! Tu bot debería estar corriendo 24/7** 🎉
