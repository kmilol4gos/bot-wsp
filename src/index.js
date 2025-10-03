/**
 * Bot de WhatsApp usando Baileys v6.6.0 (no requiere forzar `version`).
 * Incluye:
 * 1. Persistencia en ./auth_info
 * 2. Mostrar QR con múltiples métodos para máxima compatibilidad
 * 3. Manejo de DisconnectReason y errores de stream (515)
 */
const {
	default: makeWASocket,
	useMultiFileAuthState,
	DisconnectReason,
	Browsers,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const fs = require("fs");

// Intentar cargar qrcode-terminal, si no está disponible usar fallback
let qrTerminal;
try {
	qrTerminal = require("qrcode-terminal");
} catch (e) {
	console.log("qrcode-terminal no disponible, usando método alternativo");
}

// -----------------------
// FUNCIONES DE MENSAJES
// -----------------------
async function handleMessage(sock, sender, messageContent) {
	const lowerCaseMessage = messageContent.toLowerCase();

	if (/hola|buenos días|buenas tardes|buenos dias/.test(lowerCaseMessage)) {
		await sendWelcomeMessage(sock, sender);
		return;
	}

	switch (lowerCaseMessage) {
		case "1":
			await sendOpeningHours(sock, sender);
			break;
		case "2":
			await sendVisualCheckMessage(sock, sender);
			break;
		case "3":
			await sendLocationMessage(sock, sender);
			break;
		case "4":
			await sendBankAccountMessage(sock, sender);
			break;
		case "gracias":
			await sendThanksMessage(sock, sender);
			break;
		default:
			// Opcional: mensaje por defecto
			break;
	}
}

async function sendWelcomeMessage(sock, sender) {
	const replyMessage = `👋 Bienvenido(a) a *Óptica Jorvics*

Soy su asistente virtual y estoy aquí para ayudarle. 

🚨 *AVISO IMPORTANTE:* Estaremos cerrados el jueves 4, viernes 5 y sábado 6 de Septiembre.
✅ *DÍAS ESPECIALES:* Abriremos los sábados 13 y 27 de Septiembre.

Para obtener información, por favor escriba el NÚMERO de la opción que desea consultar:

1️⃣  Para conocer nuestros *HORARIOS DE ATENCIÓN*
2️⃣  Para agendar un *CHEQUEO VISUAL GRATUITO*
3️⃣  Para saber *CÓMO LLEGAR* a nuestra óptica
4️⃣  Para ver nuestra *INFORMACIÓN BANCARIA*
`;
	await sock.sendMessage(sender, { text: replyMessage });
}

async function sendOpeningHours(sock, sender) {
	const replyMessage = `🕐 *HORARIOS DE ATENCIÓN*

Entre semana:
- De Lunes a Viernes
- Mañana: 10:00 AM a 2:00 PM
- Tarde: 3:00 PM a 7:00 PM

Días especiales de Octubre:
- Sábado 11 y Sábado 25
- Horario: 10:00 AM a 2:00 PM

Si necesita otra información, puede escribir otro número de las opciones anteriores.`;
	await sock.sendMessage(sender, { text: replyMessage });
}

async function sendVisualCheckMessage(sock, sender) {
	const replyMessage = `👁️ *CHEQUEO VISUAL GRATUITO*

Le ofrecemos un chequeo visual sin costo al comprar sus lentes.

Horarios para chequeos:
- Lunes a Viernes:
  Mañana: 11:30 AM a 1:30 PM
  Tarde: 3:30 PM a 6:00 PM
- Sábado 11 y Sábado 25 de Octubre:
  De 10:00 AM a 2:00 PM

Para agendar su hora:
✅ Solo se acepta agendamiento por WhatsApp
❌ No aceptamos agendamiento por llamadas telefónicas`;
	await sock.sendMessage(sender, { text: replyMessage });
}

async function sendLocationMessage(sock, sender) {
	const replyMessage = `📍 *¿CÓMO LLEGAR A ÓPTICA JORVICS?*

Nuestra dirección es:
Gran Avenida José Miguel Carrera 6483
La Cisterna, Región Metropolitana

Punto de referencia: 
- Estamos cerca al METRO LO OVALLE

Para ver el mapa en su teléfono, haga clic en este enlace:
https://maps.app.goo.gl/apFHXEmwkMx8tGb18
`;
	await sock.sendMessage(sender, { text: replyMessage });
}

async function sendBankAccountMessage(sock, sender) {
	const replyMessage = `💳 *INFORMACIÓN BANCARIA*

Estos son nuestros datos bancarios para transferencias:

- Banco: Scotiabank
- Nombre: Victor Moraga Pino
- RUT: 4.882.101-4
- Tipo: Cuenta Corriente
- Número: 57015829
- Correo: jorvics6483@gmail.com

Por favor, después de realizar su transferencia, envíenos el comprobante por este mismo WhatsApp.`;
	await sock.sendMessage(sender, { text: replyMessage });
}

async function sendThanksMessage(sock, sender) {
	const replyMessage = `🙏 ¡Gracias por contactarnos! 

Recuerde que puede escribir cualquier número del 1 al 4 si necesita más información.

¡Que tenga un excelente día!`;
	await sock.sendMessage(sender, { text: replyMessage });
}

// Función para mostrar QR con múltiples métodos
function displayQR(qr) {
	console.log("⏳ Escanea este código QR con tu WhatsApp (MD):");
	console.log(
		"================================================================"
	);

	// Método 1: Generar URL de imagen QR (para AWS y navegadores)
	try {
		const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
			qr
		)}`;
		console.log("🖼️  CÓDIGO QR COMO IMAGEN (copia esta URL en tu navegador):");
		console.log(qrImageUrl);
		console.log(
			"================================================================"
		);
	} catch (e) {
		console.log("Error generando URL de QR:", e);
	}

	// Método 2: Intentar mostrar QR en terminal (puede no funcionar en AWS)
	try {
		qrcode.toString(
			qr,
			{
				type: "terminal",
				small: true,
				errorCorrectionLevel: "M",
			},
			(err, qrString) => {
				if (err) {
					console.error("Error generando QR en terminal:", err);
				} else {
					console.log("📱 QR en texto (puede no verse bien en servidores):");
					console.log(qrString);
				}
				console.log(
					"================================================================"
				);
				console.log("📱 Si no puedes ver el QR arriba, usa la URL de imagen");
				console.log("📱 Instrucciones:");
				console.log("   1. Copia la URL de imagen QR");
				console.log("   2. Ábrela en tu navegador");
				console.log("   3. Escanea el QR desde tu teléfono con WhatsApp");
				console.log(
					"   4. WhatsApp > Dispositivos vinculados > Vincular dispositivo"
				);
				console.log(
					"================================================================"
				);
			}
		);
	} catch (e) {
		console.log("Error con QR en terminal:", e);
		console.log(
			"================================================================"
		);
		console.log("⚠️ Usa la URL de imagen arriba para ver el QR");
		console.log(
			"================================================================"
		);
	}
}

// ----------------------------------
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ----------------------------------
async function startBot() {
	// 1. Carga o crea estado de autenticación en ./auth_info
	const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

	// 2. Crear el socket sin `version` (Baileys v6.6.0 lo maneja internamente)
	const sock = makeWASocket({
		auth: state,
		browser: Browsers.appropriate("Optibot-Baileys"), // Usar un navegador apropiado para el SO
		// syncFullHistory: true, // Opcional, si necesita recuperar chats previos
	});

	// 3. Guardar credenciales cada vez que Baileys las actualice
	sock.ev.on("creds.update", saveCreds);

	// 4. Manejo de eventos de conexión
	sock.ev.on("connection.update", (update) => {
		const { connection, lastDisconnect, qr } = update;

		// 4.1. Si hay QR, usar función mejorada
		if (qr) {
			displayQR(qr);
		}

		// 4.2. Si la conexión se cierra
		if (connection === "close") {
			const statusCode = lastDisconnect?.error?.output?.statusCode;
			console.log("❌ Conexión cerrada. Código de status:", statusCode);
			console.log(
				"Detalle del último error:",
				JSON.stringify(lastDisconnect, null, 2)
			);

			// Si no es logout (401), reintentar en 5 s
			if (statusCode !== DisconnectReason.loggedOut) {
				console.log("🔄 Reconectando en 5 segundos...");
				setTimeout(startBot, 5000);
			} else {
				console.log("🚫 Sesión cerrada permanentemente (loggedOut).");
				console.log(
					"   - Para obtener un nuevo QR, elimina ./auth_info y reinicia el bot."
				);
			}
		}

		// 4.3. Si la conexión se abrió correctamente
		if (connection === "open") {
			console.log("✅ Conectado exitosamente a WhatsApp");
		}
	});

	// 5. Capturar errores de stream (por ejemplo, "515")
	sock.ws.on("CB:stream:error", (err) => {
		console.error("⚠️ Error de stream:", err);
		if (err?.code === "515") {
			console.log("🚨 Error 515: reiniciando conexión en 5 s...");
			setTimeout(startBot, 5000);
		}
	});

	// 6. Escuchar mensajes entrantes
	sock.ev.on("messages.upsert", async (m) => {
		try {
			const msg = m.messages[0];
			if (!msg.message || msg.key.fromMe) return;

			const sender = msg.key.remoteJid;
			const messageContent =
				msg.message.conversation || msg.message.extendedTextMessage?.text;
			if (messageContent) {
				await handleMessage(sock, sender, messageContent);
			}
		} catch (error) {
			console.error("🚧 Error manejando mensaje:", error);
		}
	});
}

// 7. Ejecutar el bot
startBot();
