# Bot WhatsApp - Arquitectura BuilderBot + Baileys

Bot de WhatsApp profesional con arquitectura modular inspirada en [BuilderBot](https://www.builderbot.app/), implementado con Baileys.

## 🌟 Características Principales

- ✅ **Sistema de flujos modulares** - Organiza conversaciones con `addKeyword` y `addAnswer`
- ✅ **Gestión de estado** - Mantén datos por usuario durante toda la conversación
- ✅ **Callbacks y acciones** - Lógica personalizada en cada paso del flujo
- ✅ **Delays programables** - Controla el timing perfecto de los mensajes
- ✅ **Soporte multimedia** - Envía imágenes, archivos, ubicaciones y más
- ✅ **Regex support** - Detección avanzada de patrones en mensajes
- ✅ **API REST** - Envía mensajes vía HTTP
- ✅ **Docker ready** - Despliegue fácil con Docker Compose
- ✅ **Arquitectura limpia** - Código mantenible y escalable

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración (opcional)

```bash
cp .env.example .env
# Edita .env con tu configuración
```

### Ejecutar el bot

**Opción 1: Versión BuilderBot (recomendada)**

```bash
npm run dev
# o
npm run start:builderbot
```

**Opción 2: Versión original**

```bash
npm start
```

**Opción 3: Con servidor HTTP**

```bash
node src/app-full.js
```

Al iniciar, escanea el código QR con tu WhatsApp.

## 📚 Documentación

- 📖 [Guía completa de BuilderBot](./README_BUILDERBOT.md)
- 📂 [Ejemplos de flujos](./src/flows/examples.flow.js)

## 📁 Estructura del Proyecto

```
bot-wsp/
├── src/
│   ├── core/                    # Núcleo del framework
│   │   ├── flow.js              # Sistema de flujos (addKeyword, addAnswer)
│   │   ├── bot.js               # Core del bot
│   │   └── state.js             # Gestión de estado por usuario
│   │
│   ├── provider/                # Proveedores de mensajería
│   │   └── baileys.provider.js  # Implementación Baileys
│   │
│   ├── server/                  # Servidor HTTP API
│   │   └── http.server.js       # API REST
│   │
│   ├── flows/                   # Flujos de conversación
│   │   ├── welcome.flow.js      # Flujo de bienvenida
│   │   ├── hours.flow.js        # Horarios de atención
│   │   ├── visual-check.flow.js # Chequeo visual
│   │   ├── location.flow.js     # Ubicación
│   │   ├── bank.flow.js         # Info bancaria
│   │   ├── thanks.flow.js       # Agradecimiento
│   │   └── examples.flow.js     # Ejemplos avanzados
│   │
│   ├── app.js                   # App principal (BuilderBot style)
│   ├── app-full.js              # App con HTTP server
│   └── index.js                 # Versión original
│
├── auth_info/                   # Sesión de WhatsApp (auto-generado)
├── docker-compose.yml           # Docker Compose
├── Dockerfile                   # Dockerfile
├── package.json
└── README.md
```

## 🎯 Uso Básico

### Crear un flujo simple

```javascript
// src/flows/mi-flujo.flow.js
const { addKeyword } = require("../core/flow");

const miFlow = addKeyword(["hola", "hi"])
	.addAnswer("¡Hola! 👋")
	.addAnswer("¿Cómo puedo ayudarte?");

module.exports = miFlow;
```

### Registrar el flujo

```javascript
// src/app.js
const miFlow = require("./flows/mi-flujo.flow");

const flows = createFlow([
	welcomeFlow,
	miFlow, // ← Agregar aquí
	// ... otros flujos
]);
```

## 🔥 Ejemplos Avanzados

### Flujo con callback

```javascript
const calculatorFlow = addKeyword(["calcular"]).addAnswer(
	"Dame dos números separados por espacio",
	null,
	async (ctx, { flowDynamic }) => {
		const [a, b] = ctx.body.split(" ").map(Number);
		const sum = a + b;
		await flowDynamic(`Resultado: ${sum}`);
	}
);
```

### Flujo con estado

```javascript
const registerFlow = addKeyword(["registro"])
	.addAnswer("¿Tu nombre?")
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		await state.update({ name: ctx.body });
		await flowDynamic(`Hola ${ctx.body}! ¿Tu email?`);
	});
```

### Flujo con delay

```javascript
const delayFlow = addKeyword(["info"])
	.addAnswer("Mensaje 1", { delay: 1000 })
	.addAnswer("Mensaje 2", { delay: 2000 })
	.addAnswer("Mensaje 3", { delay: 3000 });
```

### Flujo con imagen

```javascript
const imageFlow = addKeyword(["foto"]).addAnswer("Aquí está:", {
	media: "https://i.imgur.com/0HpzsEm.png",
});
```

## 🌐 API REST

Si ejecutas con `app-full.js`, tendrás acceso a una API HTTP:

### Endpoints

**POST /v1/messages** - Enviar mensaje

```bash
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "number": "56912345678",
    "message": "Hola desde la API!",
    "media": "https://url-imagen.jpg"
  }'
```

**GET /health** - Estado del servidor

```bash
curl http://localhost:3000/health
```

**GET /state/:userId** - Estado de un usuario

```bash
curl http://localhost:3000/state/56912345678@s.whatsapp.net
```

## 🐳 Docker

### Construir y ejecutar

```bash
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f
```

### Detener

```bash
docker-compose down
```

## 🛠️ Scripts Disponibles

```bash
npm start              # Ejecuta versión original (index.js)
npm run dev            # Ejecuta versión BuilderBot (app.js)
npm run start:builderbot  # Alias de dev
npm run clean          # Limpia la sesión de WhatsApp
```

## ⚙️ Variables de Entorno

```bash
PORT=3000              # Puerto del servidor HTTP
ENABLE_HTTP=true       # Habilitar servidor HTTP
BOT_NAME="Mi Bot"      # Nombre del bot
```

## 📖 Conceptos Clave

### Flows (Flujos)

Define la estructura de las conversaciones con palabras clave y respuestas.

### Keywords (Palabras Clave)

Activan los flujos cuando el usuario las escribe.

### Answers (Respuestas)

Mensajes que el bot envía automáticamente.

### Actions (Acciones)

Código personalizado que se ejecuta durante el flujo.

### State (Estado)

Datos que se mantienen por usuario durante la conversación.

### Callbacks

Funciones que se ejecutan con cada mensaje/respuesta.

Ver [documentación completa](./README_BUILDERBOT.md) para más detalles.

## 🔍 Troubleshooting

### El QR no aparece

- Verifica que el puerto 3000 esté libre
- Revisa los logs en la consola
- Asegúrate de tener conexión a internet

### No responde a mensajes

- Verifica que los flujos estén registrados correctamente
- Revisa que las palabras clave coincidan (mayúsculas/minúsculas)
- Chequea los logs para ver errores

### Error de conexión

- Elimina la carpeta `auth_info` y escanea el QR nuevamente
- Verifica tu conexión a internet
- Asegúrate de que WhatsApp esté actualizado en tu teléfono

### Limpiar sesión

```bash
npm run clean
# Luego reinicia el bot
```

## 📝 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 💡 Inspiración

Este proyecto está inspirado en [BuilderBot](https://www.builderbot.app/), un framework increíble para crear chatbots. La implementación usa Baileys para la conexión a WhatsApp.

## 📞 Soporte

- 📧 Issues: [GitHub Issues](https://github.com/tu-usuario/bot-wsp/issues)
- 📚 Docs: [README_BUILDERBOT.md](./README_BUILDERBOT.md)
- 💬 Ejemplos: [examples.flow.js](./src/flows/examples.flow.js)

---

**Hecho con ❤️ usando Baileys + Arquitectura BuilderBot**
