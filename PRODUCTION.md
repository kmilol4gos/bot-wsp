# 🚀 Despliegue en Producción - Checklist

Esta es una guía rápida para desplegar el bot en AWS.

## ✅ Pre-despliegue (En tu computadora local)

### 1. Vincular WhatsApp primero (IMPORTANTE)

```bash
# Ejecuta el bot localmente
npm run dev

# Escanea el QR con WhatsApp
# Espera hasta ver: ✅ Conectado exitosamente a WhatsApp

# Detén el bot (Ctrl+C)
```

**Resultado:** Tendrás una carpeta `auth_info/` con tu sesión activa.

### 2. Verificar que la sesión funciona

```bash
# Ejecuta nuevamente
npm run dev

# NO debería aparecer un QR nuevo
# Debería conectarse directamente
```

### 3. Preparar archivos para AWS

```bash
# Asegúrate de tener estos archivos:
ls -la auth_info/  # Debe contener creds.json y otros archivos

# Verifica el .gitignore
cat .gitignore | grep auth_info  # auth_info/ debe estar listado
```

---

## 🏗️ Despliegue en AWS

### Método 1: EC2 (Recomendado - Más económico ~$3-9/mes)

#### Paso 1: Crear instancia EC2

```bash
# Opción A: Usando AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name TU-KEY-PAIR \
  --security-group-ids sg-XXXXX

# Opción B: Usando la consola de AWS
# 1. Ve a EC2 > Launch Instance
# 2. Selecciona Amazon Linux 2
# 3. Tipo: t2.micro (capa gratuita)
# 4. Configura Security Group: Puerto 22 (SSH), opcionalmente 3000 (HTTP)
```

#### Paso 2: Conectarse a EC2

```bash
ssh -i "tu-key.pem" ec2-user@ec2-XX-XX-XX-XX.compute-1.amazonaws.com
```

#### Paso 3: Ejecutar script de instalación

```bash
# Descargar el script de instalación
curl -O https://raw.githubusercontent.com/tu-repo/bot-wsp/main/deploy-ec2.sh

# Dar permisos
chmod +x deploy-ec2.sh

# Ejecutar
bash deploy-ec2.sh
```

#### Paso 4: Clonar tu proyecto

```bash
# Si es repositorio público
cd ~/bot-wsp
git clone https://github.com/tu-usuario/bot-wsp.git .

# Si es repositorio privado
git clone https://TU_TOKEN@github.com/tu-usuario/bot-wsp.git .
```

#### Paso 5: Copiar auth_info desde tu computadora

```bash
# En tu computadora local (otra terminal)
# Comprime auth_info
cd /Users/camilolagos/Development/bot-wsp
tar -czf auth_info.tar.gz auth_info/

# Copia a EC2
scp -i "tu-key.pem" auth_info.tar.gz ec2-user@ec2-XX-XX-XX-XX.compute-1.amazonaws.com:~/bot-wsp/

# En EC2, descomprime
ssh -i "tu-key.pem" ec2-user@ec2-XX-XX-XX-XX.compute-1.amazonaws.com
cd ~/bot-wsp
tar -xzf auth_info.tar.gz
rm auth_info.tar.gz
```

#### Paso 6: Iniciar el bot

```bash
# Construir la imagen
docker-compose build

# Ejecutar en background
docker-compose up -d

# Ver logs para verificar que funciona
docker-compose logs -f
```

#### Paso 7: Verificar que funciona

Deberías ver en los logs:

```
✅ Conectado exitosamente a WhatsApp
🚀 Bot iniciado correctamente
📱 Esperando mensajes...
```

---

### Método 2: Amazon Lightsail (Más simple)

#### Paso 1: Crear instancia

1. Ve a [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Clic en "Create instance"
3. Selecciona "Linux/Unix" > "OS Only" > "Amazon Linux 2"
4. Elige plan ($3.50/mes o $5/mes)
5. Nombra: "whatsapp-bot"
6. Clic en "Create instance"

#### Paso 2: Configurar firewall

En la instancia, ve a "Networking" y agrega:

- Aplicación: Custom
- Protocolo: TCP
- Puerto: 3000 (si usarás HTTP API)

#### Paso 3: Conectarse vía SSH

Usa el SSH browser-based o descarga la key y conéctate:

```bash
ssh -i LightsailDefaultKey-us-east-1.pem ec2-user@tu-ip-publica
```

#### Paso 4: Continúa desde el Paso 3 del Método 1

---

## 🔄 Mantenimiento

### Ver logs en tiempo real

```bash
docker-compose logs -f
```

### Reiniciar el bot

```bash
docker-compose restart
```

### Detener el bot

```bash
docker-compose down
```

### Actualizar el bot

```bash
# Pull cambios
git pull

# Reconstruir
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup de la sesión

```bash
# En EC2
cd ~/bot-wsp
tar -czf auth_backup_$(date +%Y%m%d).tar.gz auth_info/

# Descargar a tu computadora
# En tu computadora:
scp -i "tu-key.pem" ec2-user@tu-ip:~/bot-wsp/auth_backup_*.tar.gz ./
```

---

## 🔍 Troubleshooting

### Error: Cannot connect to WhatsApp

**Solución:** Revisa que auth_info se copió correctamente

```bash
ls -la auth_info/
# Debe mostrar: creds.json y varios app-state-sync-*.json
```

### El bot se desconecta constantemente

**Solución 1:** Verifica memoria

```bash
free -m
docker stats
```

**Solución 2:** Usa el supervisor

```bash
# Edita docker-compose.yml
# Cambia CMD a:
command: npm run start:supervisor
```

### No puedo copiar auth_info a EC2

**Alternativa:** Ejecuta el bot en EC2 con pantalla compartida

```bash
# En EC2, instala tmux
sudo yum install tmux -y

# Inicia sesión tmux
tmux new -s whatsapp

# Ejecuta el bot
cd ~/bot-wsp
docker-compose up

# Aparecerá el QR
# Copia la URL del QR
# Ábrela en tu navegador
# Escanéala con WhatsApp

# Una vez conectado, detén con Ctrl+C
# Sal de tmux: Ctrl+B, luego D

# Inicia en background
docker-compose up -d
```

---

## 💰 Costos

### EC2 t2.micro (Capa gratuita - primer año)

- ✅ GRATIS los primeros 12 meses
- Luego: ~$8.50/mes

### Lightsail

- ✅ $3.50/mes (512MB RAM, 1 vCPU)
- ✅ $5/mes (1GB RAM, 1 vCPU) - **Recomendado**

### ECS Fargate

- ~$11/mes (más escalable pero más caro)

---

## 📊 Monitoreo

### CloudWatch (si usas EC2)

```bash
# Instalar CloudWatch agent
sudo yum install amazon-cloudwatch-agent -y
```

### Logs locales

```bash
# Ver logs del supervisor
tail -f logs/bot-*.log

# Ver logs de Docker
docker-compose logs --tail=100 -f
```

---

## 🔒 Seguridad

### 1. Nunca subas auth_info a Git

```bash
# Verifica .gitignore
cat .gitignore | grep auth_info
```

### 2. Usa variables de entorno

```bash
# Crea .env en producción
cp .env.production .env
nano .env
```

### 3. Actualiza Security Groups

Solo permite tu IP para SSH:

```bash
# En AWS Console > EC2 > Security Groups
# Edita inbound rules
# SSH (22): Tu_IP/32
```

---

## ✅ Checklist de Despliegue

- [ ] Bot funciona localmente
- [ ] WhatsApp vinculado (auth_info creado)
- [ ] .gitignore configurado correctamente
- [ ] Instancia EC2/Lightsail creada
- [ ] Docker y Docker Compose instalados
- [ ] Proyecto clonado en servidor
- [ ] auth_info copiado al servidor
- [ ] Bot ejecutándose con docker-compose
- [ ] Logs muestran conexión exitosa
- [ ] Auto-inicio configurado
- [ ] Backup de auth_info realizado

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica la memoria: `free -m`
3. Consulta [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) para guía detallada
4. Revisa [fix-405.md](./fix-405.md) si aparece error 405

---

**¡Tu bot ya está corriendo 24/7 en AWS!** 🎉
