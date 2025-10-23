# Bot de WhatsApp - Arquitectura BuilderBot + Baileys

Bot de WhatsApp con arquitectura modular inspirada en [BuilderBot](https://www.builderbot.app/), implementado con Baileys.

## 🚀 Características

- ✅ **Sistema de flujos modulares** - Organiza conversaciones con `addKeyword` y `addAnswer`
- ✅ **Gestión de estado** - Mantén datos por usuario durante la conversación
- ✅ **Callbacks y acciones** - Lógica personalizada en cada paso
- ✅ **Delays programables** - Controla el timing de los mensajes
- ✅ **Soporte multimedia** - Envía imágenes, archivos, ubicaciones
- ✅ **Regex support** - Detección avanzada de patrones
- ✅ **Arquitectura limpia** - Código mantenible y escalable

## 📦 Instalación

```bash
npm install
```

## 🎯 Uso

### Iniciar el bot

```bash
npm start
```

O con el nuevo archivo:

```bash
node src/app.js
```

## 📚 Conceptos básicos

### 1. Flujos (Flows)

Los flujos definen la estructura de la conversación. Cada flujo comienza con `addKeyword` y puede tener múltiples `addAnswer` y `addAction`.

```javascript
const { addKeyword } = require("./core/flow");

const welcomeFlow = addKeyword(["hola", "hi"])
	.addAnswer("¡Bienvenido!")
	.addAnswer("¿Cómo puedo ayudarte?");
```

### 2. Keywords

Define palabras clave que activan el flujo:

```javascript
// Una sola palabra
addKeyword("hola");

// Múltiples palabras
addKeyword(["hola", "hi", "buenos días"]);

// Con regex
addKeyword(/\d{4}/, { regex: true });

// Modo sensible (palabra exacta)
addKeyword("ACTIVAR", { sensitive: true });
```

### 3. Respuestas (Answers)

Envía mensajes al usuario:

```javascript
// Mensaje simple
.addAnswer('Hola!')

// Mensaje con líneas múltiples
.addAnswer(['Línea 1', 'Línea 2', 'Línea 3'])

// Con delay
.addAnswer('Este mensaje se envía después de 2 segundos', { delay: 2000 })

// Con imagen
.addAnswer('Mira esta imagen', {
  media: 'https://example.com/image.jpg'
})
```

### 4. Callbacks

Ejecuta lógica personalizada:

```javascript
.addAnswer(
  'Calculando...',
  null,
  async (ctx, { flowDynamic, state }) => {
    const result = 2 + 2;
    await flowDynamic(`El resultado es: ${result}`);
  }
)
```

### 5. Acciones

Ejecuta código sin enviar mensaje automático:

```javascript
.addAction(async (ctx, { flowDynamic }) => {
  // Tu lógica aquí
  await flowDynamic('Mensaje dinámico');
})

// Con captura de respuesta
.addAction(
  { capture: true },
  async (ctx, { state }) => {
    await state.update({ userInput: ctx.body });
  }
)
```

### 6. Helpers disponibles

En callbacks y acciones tienes acceso a:

```javascript
{
  // Enviar mensajes dinámicos
  flowDynamic: async (message, options) => {},

  // Gestión de estado
  state: {
    get: () => {},      // Obtener estado del usuario
    update: (data) => {},  // Actualizar estado
    clear: () => {},    // Limpiar estado
  },

  // Enviar mensajes
  sendMessage: async (message, options) => {},

  // Enviar imágenes
  sendImage: async (url, caption) => {},

  // Enviar archivos
  sendFile: async (url, mimetype, fileName) => {},

  // Enviar ubicación
  sendLocation: async (latitude, longitude, name) => {},
}
```

### 7. Contexto (ctx)

Información del mensaje recibido:

```javascript
{
  body: "texto del mensaje",
  from: "número@s.whatsapp.net",
  pushName: "Nombre del usuario",
  message: { /* objeto de Baileys */ },
  key: { /* info de Baileys */ }
}
```

## 🔥 Ejemplos

### Ejemplo 1: Flujo básico

```javascript
const { addKeyword } = require("./core/flow");

const basicFlow = addKeyword(["menu", "ayuda"])
	.addAnswer("📋 *MENÚ PRINCIPAL*")
	.addAnswer(["1. Opción 1", "2. Opción 2", "3. Opción 3"].join("\n"));

module.exports = basicFlow;
```

### Ejemplo 2: Flujo con callback

```javascript
const calculatorFlow = addKeyword(["calcular", "suma"]).addAnswer(
	"🧮 Calculadora",
	null,
	async (ctx, { flowDynamic }) => {
		const result = 5 + 5;
		await flowDynamic(`Resultado: ${result}`);
	}
);
```

### Ejemplo 3: Flujo con estado

```javascript
const registerFlow = addKeyword(["registro"])
	.addAnswer("¿Cuál es tu nombre?")
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		await state.update({ name: ctx.body });
		await flowDynamic(`Hola ${ctx.body}! ¿Cuál es tu email?`);
	})
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		await state.update({ email: ctx.body });
		const data = state.get();

		await flowDynamic("✅ Registro completado:");
		await flowDynamic(`Nombre: ${data.name}`);
		await flowDynamic(`Email: ${data.email}`);
	});
```

### Ejemplo 4: Flujo con imagen

```javascript
const imageFlow = addKeyword(["foto", "imagen"])
	.addAnswer("📸 Aquí tienes la imagen:")
	.addAnswer("Descripción", {
		media: "https://i.imgur.com/0HpzsEm.png",
		delay: 500,
	});
```

### Ejemplo 5: Flujo con regex

```javascript
const emailFlow = addKeyword(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
	regex: true,
}).addAnswer(
	"📧 Email detectado",
	null,
	async (ctx, { flowDynamic, state }) => {
		await state.update({ email: ctx.body });
		await flowDynamic(`Tu email: ${ctx.body}`);
	}
);
```

## 📁 Estructura del proyecto

```
bot-wsp/
├── src/
│   ├── core/               # Núcleo del sistema
│   │   ├── flow.js        # Sistema de flujos
│   │   ├── bot.js         # Core del bot
│   │   └── state.js       # Gestión de estado
│   │
│   ├── provider/          # Proveedores de mensajería
│   │   └── baileys.provider.js
│   │
│   ├── flows/             # Flujos de conversación
│   │   ├── welcome.flow.js
│   │   ├── hours.flow.js
│   │   ├── visual-check.flow.js
│   │   ├── location.flow.js
│   │   ├── bank.flow.js
│   │   ├── thanks.flow.js
│   │   └── examples.flow.js
│   │
│   ├── app.js             # Aplicación principal (NUEVO)
│   └── index.js           # Versión original
│
├── auth_info/             # Sesión de WhatsApp
├── package.json
└── README.md
```

## 🔧 Configuración

### Agregar nuevos flujos

1. Crea un nuevo archivo en `src/flows/`:

```javascript
// src/flows/mi-flujo.flow.js
const { addKeyword } = require("../core/flow");

const miFlow = addKeyword(["palabra clave"]).addAnswer("Respuesta del flujo");

module.exports = miFlow;
```

2. Importa y registra en `src/app.js`:

```javascript
const miFlow = require("./flows/mi-flujo.flow");

const flows = createFlow([
	welcomeFlow,
	// ... otros flujos
	miFlow, // Agregar aquí
]);
```

## 🎨 Características avanzadas

### Mensajes consecutivos con delay

```javascript
addKeyword("tutorial")
	.addAnswer("Paso 1", { delay: 1000 })
	.addAnswer("Paso 2", { delay: 2000 })
	.addAnswer("Paso 3", { delay: 3000 });
```

### Enviar ubicación

```javascript
addKeyword("ubicación")
	.addAnswer("📍 Nuestra ubicación:")
	.addAction(async (ctx, { sendLocation }) => {
		await sendLocation(-33.5288, -70.6631, "Mi Negocio");
	});
```

### Validaciones personalizadas

```javascript
addKeyword("edad")
	.addAnswer("¿Cuántos años tienes?")
	.addAction({ capture: true }, async (ctx, { flowDynamic }) => {
		const age = parseInt(ctx.body);

		if (isNaN(age)) {
			await flowDynamic("❌ Debes escribir un número");
			return;
		}

		if (age < 18) {
			await flowDynamic("Debes ser mayor de edad");
		} else {
			await flowDynamic("✅ Edad válida");
		}
	});
```

## 🐳 Docker

El proyecto incluye Docker y Docker Compose para facilitar el despliegue:

```bash
docker-compose up -d
```

## 📝 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o problemas, abre un issue en GitHub.

---

**Desarrollado con ❤️ usando Baileys y arquitectura BuilderBot**
