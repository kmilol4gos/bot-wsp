# 🚀 Guía de Inicio Rápido

Esta es una guía paso a paso para empezar a usar tu bot de WhatsApp.

## ⚡ Pasos Rápidos

### 1. Instalar dependencias

```bash
npm install
```

### 2. Probar el sistema (opcional pero recomendado)

```bash
npm test
```

Deberías ver:

```
✅ Test 1: Flujo básico
✅ Test 2: Múltiples keywords
✅ Test 3: Flujo con delay
...
🎉 Todos los tests completados exitosamente!
```

### 3. Ejecutar el bot

Tienes 3 opciones:

**Opción A: Versión BuilderBot (Recomendada) ⭐**

```bash
npm run dev
```

**Opción B: Versión con API HTTP**

```bash
npm run start:full
```

**Opción C: Versión original**

```bash
npm start
```

### 4. Escanear el código QR

1. Cuando ejecutes el bot, verás un código QR en la terminal
2. Abre WhatsApp en tu teléfono
3. Ve a **Configuración** → **Dispositivos vinculados**
4. Toca **Vincular un dispositivo**
5. Escanea el código QR

### 5. ¡Prueba el bot!

Envía estos mensajes a tu número de WhatsApp:

- `hola` → Ver menú de bienvenida
- `1` → Ver horarios de atención
- `2` → Información sobre chequeo visual
- `3` → Ver ubicación
- `4` → Información bancaria
- `gracias` → Mensaje de despedida

## 🎨 Personalizar el Bot

### Crear tu propio flujo

1. Crea un archivo en `src/flows/`:

```javascript
// src/flows/mi-flujo.flow.js
const { addKeyword } = require("../core/flow");

const miFlow = addKeyword(["saludo", "saludar"])
	.addAnswer("¡Hola! 👋")
	.addAnswer("Este es mi flujo personalizado")
	.addAnswer("¿En qué puedo ayudarte?");

module.exports = miFlow;
```

2. Importa y registra en `src/app.js`:

```javascript
// Al inicio del archivo
const miFlow = require("./flows/mi-flujo.flow");

// En la sección de createFlow
const flows = createFlow([
	welcomeFlow,
	hoursFlow,
	miFlow, // ← Agregar tu flujo aquí
	// ... otros flujos
]);
```

3. Reinicia el bot

```bash
# Ctrl+C para detener
npm run dev
```

## 📱 Ejemplos de Flujos

### Flujo simple

```javascript
const simpleFlow = addKeyword(["precio", "costo"])
	.addAnswer("Nuestros precios son:")
	.addAnswer("- Servicio básico: $10.000")
	.addAnswer("- Servicio premium: $20.000");
```

### Flujo con delay

```javascript
const delayFlow = addKeyword(["info"])
	.addAnswer("Te enviaré la información...")
	.addAnswer("Paso 1", { delay: 1000 })
	.addAnswer("Paso 2", { delay: 2000 })
	.addAnswer("Paso 3", { delay: 3000 });
```

### Flujo con imagen

```javascript
const imageFlow = addKeyword(["catálogo", "productos"]).addAnswer(
	"Aquí está nuestro catálogo:",
	{
		media: "https://tu-sitio.com/catalogo.jpg",
	}
);
```

### Flujo con callback

```javascript
const calculatorFlow = addKeyword(["calcular", "sumar"]).addAnswer(
	"Calculando...",
	null,
	async (ctx, { flowDynamic }) => {
		const result = 2 + 2;
		await flowDynamic(`El resultado es: ${result}`);
	}
);
```

### Flujo con captura de datos

```javascript
const registerFlow = addKeyword(["registro"])
	.addAnswer("¿Cuál es tu nombre?")
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		const name = ctx.body;
		await state.update({ name });
		await flowDynamic(`Hola ${name}! ¿Cuál es tu email?`);
	})
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		const email = ctx.body;
		await state.update({ email });

		const data = state.get();
		await flowDynamic("✅ Registro completado");
		await flowDynamic(`Nombre: ${data.name}`);
		await flowDynamic(`Email: ${data.email}`);
	});
```

## 🌐 Usar la API HTTP

Si ejecutaste con `npm run start:full`, puedes enviar mensajes desde tu código:

### JavaScript/Node.js

```javascript
fetch("http://localhost:3000/v1/messages", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		number: "56912345678",
		message: "¡Hola desde la API!",
	}),
})
	.then((res) => res.json())
	.then((data) => console.log(data));
```

### cURL

```bash
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "number": "56912345678",
    "message": "Hola desde cURL!"
  }'
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:3000/v1/messages',
    json={
        'number': '56912345678',
        'message': 'Hola desde Python!'
    }
)
print(response.json())
```

## 🔧 Solución de Problemas

### El QR no aparece

```bash
# Limpia la sesión y reinicia
npm run clean
npm run dev
```

### El bot no responde

1. Verifica que el flujo esté registrado en `src/app.js`
2. Revisa que las palabras clave coincidan
3. Mira los logs en la consola

### Error de conexión

```bash
# Elimina la sesión
rm -rf auth_info
# Reinicia el bot
npm run dev
```

## 📚 Documentación Completa

- [README Principal](../README.md)
- [Guía BuilderBot Completa](../README_BUILDERBOT.md)
- [Ejemplos Avanzados](../src/flows/examples.flow.js)

## 🎯 Próximos Pasos

1. ✅ Ejecutar el bot y escanearlo
2. ✅ Probar los flujos existentes
3. ✅ Crear tu primer flujo personalizado
4. 📖 Leer la [documentación completa](../README_BUILDERBOT.md)
5. 🎨 Ver los [ejemplos avanzados](../src/flows/examples.flow.js)
6. 🚀 Desplegar en producción

## ❓ ¿Necesitas ayuda?

- 📖 Lee la documentación completa
- 💬 Revisa los ejemplos en `src/flows/examples.flow.js`
- 🐛 Abre un issue en GitHub

¡Disfruta construyendo tu bot! 🎉
