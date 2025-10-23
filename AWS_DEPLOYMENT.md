# 🚀 Guía de Despliegue en AWS

Esta guía te ayudará a desplegar el bot de WhatsApp en AWS usando Docker y Amazon ECS/EC2.

## 📋 Prerrequisitos

- Cuenta de AWS
- AWS CLI instalado y configurado
- Docker instalado localmente
- Sesión de WhatsApp ya vinculada (carpeta `auth_info` con sesión activa)

## 🎯 Opciones de Despliegue

### Opción 1: Amazon ECS (Recomendado para producción)

#### Paso 1: Crear repositorio en ECR

```bash
# Crear repositorio en Amazon ECR
aws ecr create-repository --repository-name whatsapp-bot --region us-east-1

# Autenticarse en ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

#### Paso 2: Construir y subir imagen

```bash
# Construir la imagen
docker build -t whatsapp-bot .

# Etiquetar la imagen
docker tag whatsapp-bot:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/whatsapp-bot:latest

# Subir la imagen a ECR
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/whatsapp-bot:latest
```

#### Paso 3: Crear EFS para persistir auth_info

```bash
# Crear sistema de archivos EFS
aws efs create-file-system --region us-east-1 --tags Key=Name,Value=whatsapp-bot-storage
```

#### Paso 4: Crear Task Definition

Crea un archivo `task-definition.json`:

```json
{
	"family": "whatsapp-bot",
	"networkMode": "awsvpc",
	"requiresCompatibilities": ["FARGATE"],
	"cpu": "256",
	"memory": "512",
	"containerDefinitions": [
		{
			"name": "whatsapp-bot",
			"image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/whatsapp-bot:latest",
			"essential": true,
			"portMappings": [
				{
					"containerPort": 3000,
					"protocol": "tcp"
				}
			],
			"environment": [
				{
					"name": "NODE_ENV",
					"value": "production"
				},
				{
					"name": "PORT",
					"value": "3000"
				}
			],
			"mountPoints": [
				{
					"sourceVolume": "auth-storage",
					"containerPath": "/usr/src/app/auth_info"
				}
			],
			"logConfiguration": {
				"logDriver": "awslogs",
				"options": {
					"awslogs-group": "/ecs/whatsapp-bot",
					"awslogs-region": "us-east-1",
					"awslogs-stream-prefix": "ecs"
				}
			}
		}
	],
	"volumes": [
		{
			"name": "auth-storage",
			"efsVolumeConfiguration": {
				"fileSystemId": "fs-XXXXXXXX",
				"transitEncryption": "ENABLED",
				"authorizationConfig": {
					"iam": "ENABLED"
				}
			}
		}
	]
}
```

#### Paso 5: Crear servicio en ECS

```bash
# Crear cluster
aws ecs create-cluster --cluster-name whatsapp-bot-cluster --region us-east-1

# Registrar task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Crear servicio
aws ecs create-service \
  --cluster whatsapp-bot-cluster \
  --service-name whatsapp-bot-service \
  --task-definition whatsapp-bot \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}"
```

---

### Opción 2: EC2 con Docker (Más económico)

#### Paso 1: Lanzar instancia EC2

```bash
# Lanzar EC2 t2.micro (capa gratuita)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-group-ids sg-XXXXX \
  --subnet-id subnet-XXXXX \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=whatsapp-bot}]'
```

#### Paso 2: Conectarse a la instancia

```bash
ssh -i "your-key.pem" ec2-user@ec2-XX-XX-XX-XX.compute-1.amazonaws.com
```

#### Paso 3: Instalar Docker y Docker Compose

```bash
# Actualizar sistema
sudo yum update -y

# Instalar Docker
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

#### Paso 4: Clonar el proyecto y configurar

```bash
# Instalar Git
sudo yum install git -y

# Clonar el repositorio
git clone https://github.com/tu-usuario/bot-wsp.git
cd bot-wsp

# Crear directorio para auth_info
mkdir -p auth_info
```

#### Paso 5: Vincular WhatsApp (Primera vez)

```bash
# Ejecutar el bot en modo interactivo para escanear QR
docker-compose up

# Escanea el QR con WhatsApp
# Una vez vinculado, presiona Ctrl+C
```

#### Paso 6: Ejecutar en background

```bash
# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

#### Paso 7: Configurar auto-inicio

```bash
# Crear servicio systemd
sudo nano /etc/systemd/system/whatsapp-bot.service
```

Contenido del archivo:

```ini
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
```

Activar el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-bot
sudo systemctl start whatsapp-bot
sudo systemctl status whatsapp-bot
```

---

### Opción 3: Amazon Lightsail (Más simple)

#### Paso 1: Crear instancia Lightsail

1. Ve a AWS Lightsail Console
2. Crea una nueva instancia
3. Selecciona "Linux/Unix"
4. Selecciona "OS Only" → "Amazon Linux 2"
5. Selecciona el plan ($3.50/mes para empezar)
6. Nombra la instancia "whatsapp-bot"

#### Paso 2: Configurar firewall

Abre los puertos:

- Puerto 22 (SSH)
- Puerto 3000 (API HTTP, opcional)

#### Paso 3: Conectarse y configurar

Sigue los mismos pasos que EC2 (Paso 2-7 de la Opción 2)

---

## 🔒 Seguridad

### 1. Variables de entorno sensibles

Crea un archivo `.env` en producción (NO lo subas a git):

```bash
NODE_ENV=production
PORT=3000
ENABLE_HTTP=false
```

### 2. Security Groups

Configura el Security Group de EC2:

```bash
# Solo SSH desde tu IP
Inbound: Port 22, Source: Tu_IP/32

# HTTP API (opcional)
Inbound: Port 3000, Source: 0.0.0.0/0
```

### 3. IAM Roles

Si usas ECS, crea un rol IAM con permisos mínimos:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"ecr:GetAuthorizationToken",
				"ecr:BatchCheckLayerAvailability",
				"ecr:GetDownloadUrlForLayer",
				"ecr:BatchGetImage",
				"logs:CreateLogStream",
				"logs:PutLogEvents"
			],
			"Resource": "*"
		}
	]
}
```

---

## 📊 Monitoreo

### CloudWatch Logs

```bash
# Crear log group
aws logs create-log-group --log-group-name /ecs/whatsapp-bot

# Ver logs
aws logs tail /ecs/whatsapp-bot --follow
```

### CloudWatch Alarms

Crea alarmas para:

- CPU > 80%
- Memory > 80%
- Container stopped

---

## 💰 Costos Estimados

### EC2 t2.micro (Opción más económica)

- Instancia: ~$8.50/mes
- EBS 8GB: ~$0.80/mes
- **Total: ~$9.30/mes**

### ECS Fargate (Escalable)

- 0.25 vCPU: ~$9/mes
- 0.5 GB RAM: ~$2/mes
- **Total: ~$11/mes**

### Lightsail (Más simple)

- Plan básico: **$3.50/mes**
- Plan recomendado: **$5/mes**

---

## 🔄 Actualización del Bot

### En EC2:

```bash
cd bot-wsp
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### En ECS:

```bash
# Reconstruir y subir imagen
docker build -t whatsapp-bot .
docker tag whatsapp-bot:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/whatsapp-bot:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/whatsapp-bot:latest

# Actualizar servicio
aws ecs update-service --cluster whatsapp-bot-cluster --service whatsapp-bot-service --force-new-deployment
```

---

## 🆘 Troubleshooting

### El bot se desconecta constantemente

1. Verifica que `auth_info` esté persistido correctamente
2. Revisa los logs: `docker-compose logs -f`
3. Asegúrate de tener suficiente memoria

### No puedo escanear el QR

1. Usa una instancia con IP pública
2. Ejecuta `docker-compose up` (sin -d) para ver el QR
3. Copia la URL del QR y ábrela en el navegador

### El contenedor se reinicia constantemente

1. Revisa logs: `docker logs whatsapp-bot`
2. Verifica memoria disponible: `docker stats`
3. Revisa el código de error

---

## 📞 Soporte

- Revisa los logs en `/usr/src/app/logs/`
- Consulta los issues de Baileys en GitHub
- Verifica el estado de WhatsApp API

---

**¡Listo! Tu bot ahora está corriendo 24/7 en AWS** 🎉
