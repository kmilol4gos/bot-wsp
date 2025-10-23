# 🏗️ Arquitectura del Bot

Este documento explica la arquitectura del bot inspirada en BuilderBot.

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    Tu Aplicación                         │
│                      (app.js)                            │
└────────────┬────────────────────────────────────────────┘
             │
             │ Importa y configura
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                  Sistema de Flujos                       │
│                   (core/flow.js)                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  addKeyword  │  │  addAnswer   │  │  addAction   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────┬────────────────────────────────────────────┘
             │
             │ Usa
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                    Bot Core                              │
│                   (core/bot.js)                          │
│                                                          │
│  • Procesa mensajes entrantes                           │
│  • Ejecuta flujos                                       │
│  • Gestiona helpers (flowDynamic, state, etc)          │
└────────────┬────────────────────────────────────────────┘
             │
             │ Se conecta a
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│               Baileys Provider                           │
│            (provider/baileys.provider.js)                │
│                                                          │
│  • Maneja conexión a WhatsApp                           │
│  • Genera y muestra QR                                  │
│  • Gestiona reconexiones                                │
└────────────┬────────────────────────────────────────────┘
             │
             │ Interactúa con
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                   WhatsApp API                           │
│                    (Baileys)                             │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de un Mensaje

```
1. Usuario envía mensaje
         │
         ▼
2. Baileys recibe mensaje
         │
         ▼
3. BotCore procesa el mensaje
         │
         ▼
4. Busca flujo que coincida con keywords
         │
         ├─ No coincide → Ignora
         │
         └─ Coincide
              │
              ▼
5. Ejecuta el flujo
         │
         ├─ Envía respuestas (addAnswer)
         │
         ├─ Ejecuta callbacks
         │
         └─ Ejecuta acciones (addAction)
              │
              ▼
6. Actualiza estado del usuario (si es necesario)
         │
         ▼
7. Envía respuesta al usuario
```

## 🧩 Componentes Principales

### 1. Flow (core/flow.js)

**Responsabilidad:** Define la estructura de las conversaciones

```javascript
class Flow {
  keywords: []       // Palabras clave que activan el flujo
  options: {}        // Configuración (regex, sensitive)
  answers: []        // Respuestas a enviar
  actions: []        // Acciones a ejecutar

  addKeyword()       // Inicia un flujo
  addAnswer()        // Agrega una respuesta
  addAction()        // Agrega una acción
  matchKeyword()     // Verifica si el mensaje coincide
  execute()          // Ejecuta el flujo
}
```

### 2. BotCore (core/bot.js)

**Responsabilidad:** Gestiona la lógica del bot

```javascript
class BotCore {
  sock: BaileysSocket      // Socket de Baileys
  flows: Flow[]            // Flujos registrados
  stateManager: StateManager  // Gestión de estado

  handleMessage()    // Procesa mensajes entrantes
  createHelpers()    // Crea helpers para callbacks
  start()           // Inicia el listener
  sendMessage()     // Envía mensaje a número específico
}
```

### 3. StateManager (core/state.js)

**Responsabilidad:** Gestiona el estado por usuario

```javascript
class StateManager {
  states: Map        // Estado de cada usuario

  get(userId)        // Obtiene estado
  update(userId, data)  // Actualiza estado
  clear(userId)      // Limpia estado
  getAll()          // Obtiene todos los estados
}
```

### 4. BaileysProvider (provider/baileys.provider.js)

**Responsabilidad:** Conexión a WhatsApp

```javascript
class BaileysProvider {
  sock: WASocket     // Socket de WhatsApp
  qrHandler: Function  // Handler del QR

  connect()          // Conecta a WhatsApp
  displayQR()        // Muestra el QR
  getSocket()        // Obtiene el socket
  onQR()            // Registra handler de QR
}
```

### 5. HttpServer (server/http.server.js)

**Responsabilidad:** API REST para el bot

```javascript
class HttpServer {
  bot: BotCore       // Referencia al bot
  port: number       // Puerto del servidor
  server: Server     // Servidor HTTP

  handleRequest()    // Maneja peticiones
  start()           // Inicia servidor
  stop()            // Detiene servidor
}
```

## 🎯 Helpers Disponibles

Los helpers son funciones que están disponibles en callbacks y acciones:

```javascript
{
  // Enviar mensajes dinámicos
  flowDynamic: async (message, options) => {
    // Envía un mensaje durante la ejecución
  },

  // Gestión de estado
  state: {
    get: () => {},        // Obtiene el estado del usuario
    update: (data) => {}, // Actualiza el estado
    clear: () => {},      // Limpia el estado
  },

  // Funciones de envío
  sendMessage: async (message, options) => {},
  sendImage: async (url, caption) => {},
  sendFile: async (url, mimetype, fileName) => {},
  sendLocation: async (lat, lng, name) => {},
}
```

## 📦 Estructura de Datos

### Flow Object

```javascript
{
  keywords: ['hola', 'hi'],
  options: {
    regex: false,
    sensitive: false
  },
  answers: [
    {
      message: 'Hola!',
      options: {
        delay: 0,
        media: null,
        capture: false,
        buttons: null
      },
      callback: null
    }
  ],
  actions: [
    {
      options: { capture: false },
      callback: async (ctx, helpers) => {}
    }
  ]
}
```

### Context Object (ctx)

```javascript
{
  body: "texto del mensaje",
  from: "número@s.whatsapp.net",
  message: { /* objeto Baileys */ },
  key: { /* metadata Baileys */ },
  pushName: "Nombre del usuario"
}
```

### State Object

```javascript
{
  // Datos específicos del usuario
  name: "Juan",
  email: "juan@example.com",
  step: 1,
  lastCalculation: 42,
  // ... cualquier otro dato
}
```

## 🔐 Gestión de Sesión

```
auth_info/
├── creds.json          # Credenciales de sesión
└── app-state-sync-*.json  # Estado de sincronización
```

**Importante:**

- No subas `auth_info/` a git (ya está en .gitignore)
- Para cerrar sesión: elimina la carpeta `auth_info`
- El QR solo aparece la primera vez o si borras la sesión

## 🚀 Ciclo de Vida del Bot

```
1. Inicio (main)
   ├─ Cargar flujos
   ├─ Crear provider
   └─ Conectar a WhatsApp
        │
        ▼
2. Autenticación
   ├─ Si hay sesión → Reconectar
   └─ Si no hay sesión → Mostrar QR
        │
        ▼
3. Conexión exitosa
   ├─ Crear BotCore
   ├─ Iniciar listeners
   └─ Opcional: Iniciar HTTP server
        │
        ▼
4. Escuchar mensajes
   ├─ Procesar cada mensaje
   ├─ Buscar flujo coincidente
   └─ Ejecutar flujo
        │
        ▼
5. Mantener conexión
   ├─ Auto-reconexión en errores
   └─ Guardar credenciales
```

## 🎨 Ejemplo Completo

```javascript
// 1. Definir flujo
const miFlow = addKeyword(["precio"])
	.addAnswer("Consultando precios...")
	.addAnswer(
		"Aquí están nuestros precios:",
		{ delay: 1000 },
		async (ctx, { flowDynamic, state }) => {
			// Lógica personalizada
			const price = calcularPrecio();
			await state.update({ lastPrice: price });
			await flowDynamic(`Precio: $${price}`);
		}
	);

// 2. Registrar flujo
const flows = createFlow([miFlow]);

// 3. Crear provider
const provider = new BaileysProvider();

// 4. Conectar
await provider.connect((sock) => {
	// 5. Crear bot
	const bot = new BotCore(sock, flows);

	// 6. Iniciar
	bot.start();
});
```

## 🔧 Extensibilidad

### Agregar nuevo provider

```javascript
class TwilioProvider {
	connect(onReady) {
		/* implementación */
	}
	getSocket() {
		/* implementación */
	}
}
```

### Agregar nueva base de datos

```javascript
class MongoStateManager {
	async get(userId) {
		/* implementación */
	}
	async update(userId, data) {
		/* implementación */
	}
}
```

### Agregar middleware

```javascript
class BotCore {
	use(middleware) {
		this.middlewares.push(middleware);
	}
}
```

## 📈 Performance

- **Conexión WebSocket persistente** - Mantiene conexión activa
- **Estado en memoria** - Rápido acceso a datos de usuario
- **Async/Await** - No bloquea el event loop
- **Reconexión automática** - Alta disponibilidad

## 🔒 Seguridad

- ✅ Sesión encriptada en `auth_info/`
- ✅ No expone credenciales en logs
- ✅ CORS configurado en API HTTP
- ⚠️ Recomendado: Usar HTTPS en producción
- ⚠️ Recomendado: Autenticación en API HTTP

## 📚 Referencias

- [BuilderBot](https://www.builderbot.app/) - Inspiración de la arquitectura
- [Baileys](https://github.com/WhiskeySockets/Baileys) - Librería de WhatsApp
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

**Esta arquitectura te permite crear bots escalables y mantenibles** 🎉
