/**
 * bot.js
 *
 * Bot de WhatsApp usando Baileys v6.6.0 (no requiere forzar `version`).
 * Incluye:
 * 1. Persistencia en ./auth_info
 * 2. Mostrar QR con printQRInTerminal en la primera ejecución
 * 3. Manejo de DisconnectReason y errores de stream (515)
 */

const {
	default: makeWASocket,
	useMultiFileAuthState,
	DisconnectReason,
	Browsers,
} = require("@whiskeysockets/baileys"); // v6.6.0
const qrcode = require("qrcode-terminal");

const diasSabado = "9 y Sábado 30 agosto";
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

Días especiales de Agosto:
- Sábado ${diasSabado}
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
- Sábados ${diasSabado}:
  De 10:00 AM a 2:00 PM

Para agendar su hora puede escribirnos por este mismo WhatsApp (solo atendemos agendas por WhatsApp).

¿Desea agendar ahora? Responda "SI" y le atenderemos personalmente.`;
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

¿Necesita más indicaciones? Responda "SI" y le ayudaremos personalmente.`;
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

// ----------------------------------
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ----------------------------------
async function startBot() {
	try {
		// 1. Carga o crea estado de autenticación en ./auth_info
		const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

		// Verificar si hay sesión válida
		const hasValidSession = state.creds?.registered;

		if (hasValidSession) {
			console.log("📱 Intentando conectar con sesión existente...");
		} else {
			console.log("🆕 No hay sesión guardada, preparando para mostrar QR...");
		}

		// 2. Crear el socket con configuración más conservadora
		const sock = makeWASocket({
			auth: state,
			printQRInTerminal: true, // Siempre mostrar QR cuando sea necesario
			browser: Browsers.ubuntu("Chrome"), // Cambiar a Ubuntu Chrome
			connectTimeoutMs: 90000, // Timeout más largo
			defaultQueryTimeoutMs: 90000,
			markOnlineOnConnect: false, // No marcar como online inmediatamente
			syncFullHistory: false, // Evitar sincronizar historial completo
			generateHighQualityLinkPreview: false, // Reducir carga
			getMessage: async () => undefined, // Evitar recuperar mensajes perdidos
		}); // 3. Guardar credenciales cada vez que Baileys las actualice
		sock.ev.on("creds.update", saveCreds);

		// 4. Manejo de eventos de conexión
		sock.ev.on("connection.update", (update) => {
			const { connection, lastDisconnect, qr } = update;

			// 4.1. Si hay QR, mostrarlo siempre
			if (qr) {
				console.log("⏳ Escanea este código QR con tu WhatsApp:");
				qrcode.generate(qr, { small: true });
				console.log(
					"� Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular dispositivo"
				);
			}

			// 4.2. Si la conexión se cierra
			if (connection === "close") {
				const statusCode = lastDisconnect?.error?.output?.statusCode;
				console.log("❌ Conexión cerrada. Código de status:", statusCode);

				// Manejar diferentes tipos de desconexión con delays más largos
				switch (statusCode) {
					case 401: // No autorizado - necesita nuevo QR
						console.log(
							"🔑 Error 401: Sesión no autorizada, necesita nuevo QR"
						);
						console.log("🗑️ Limpiando sesión para generar nuevo QR...");
						setTimeout(() => {
							// Limpiar y reiniciar para mostrar QR
							require("fs").rmSync("./auth_info", {
								recursive: true,
								force: true,
							});
							startBot();
						}, 5000);
						break;
					case 403: // Prohibido
						console.log("🚫 Error 403: Acceso prohibido");
						console.log("⏰ Esperando 60 segundos antes de reconectar...");
						setTimeout(startBot, 60000);
						break;
					case 405: // Método no permitido / IP bloqueada
						console.log("🚫 Error 405: Posible bloqueo temporal de IP");
						console.log("⏰ Esperando 60 segundos antes de reconectar...");
						setTimeout(startBot, 60000); // 1 minuto
						break;
					case DisconnectReason.badSession:
						console.log("🔧 Sesión corrupta, limpiando datos...");
						console.log("🗑️ Limpiando ./auth_info para generar nuevo QR...");
						setTimeout(() => {
							require("fs").rmSync("./auth_info", {
								recursive: true,
								force: true,
							});
							startBot();
						}, 5000);
						break;
					case DisconnectReason.connectionClosed:
						console.log("🔄 Conexión cerrada, reconectando...");
						setTimeout(startBot, 30000); // 30 segundos
						break;
					case DisconnectReason.connectionLost:
						console.log("📡 Conexión perdida, reconectando...");
						setTimeout(startBot, 45000); // 45 segundos
						break;
					case DisconnectReason.connectionReplaced:
						console.log("🔄 Conexión reemplazada, reconectando...");
						setTimeout(startBot, 30000);
						break;
					case DisconnectReason.loggedOut:
						console.log("🚫 Sesión cerrada permanentemente.");
						console.log("🗑️ Limpiando ./auth_info para generar nuevo QR...");
						setTimeout(() => {
							require("fs").rmSync("./auth_info", {
								recursive: true,
								force: true,
							});
							startBot();
						}, 5000);
						break;
					case DisconnectReason.restartRequired:
						console.log("🔄 Reinicio requerido...");
						setTimeout(startBot, 30000);
						break;
					case DisconnectReason.timedOut:
						console.log("⏰ Timeout, reconectando...");
						setTimeout(startBot, 60000); // 1 minuto
						break;
					default:
						console.log("🔄 Reconectando en 30 segundos...");
						setTimeout(startBot, 30000);
						break;
				}
			}

			// 4.3. Si la conexión se abrió correctamente
			if (connection === "open") {
				console.log("✅ Conectado exitosamente a WhatsApp");
				console.log("📞 Bot listo para recibir mensajes");
			}

			// 4.4. Estado de conectando
			if (connection === "connecting") {
				console.log("🔄 Conectando a WhatsApp...");
			}
		});

		// 5. Manejo mejorado de errores de stream
		sock.ws?.on("CB:stream:error", (err) => {
			console.error("⚠️ Error de stream:", err);
			if (err?.code === "515" || err?.code === "503") {
				console.log("🚨 Error de stream, reiniciando en 5s...");
				setTimeout(startBot, 5000);
			}
		});

		// 6. Escuchar mensajes entrantes con mejor manejo de errores
		sock.ev.on("messages.upsert", async (m) => {
			try {
				const msg = m.messages[0];
				if (!msg.message || msg.key.fromMe) return;

				const sender = msg.key.remoteJid;
				const messageContent =
					msg.message.conversation ||
					msg.message.extendedTextMessage?.text ||
					msg.message.imageMessage?.caption ||
					msg.message.videoMessage?.caption;

				if (messageContent) {
					console.log(`📥 Mensaje de ${sender}: ${messageContent}`);
					await handleMessage(sock, sender, messageContent);
				}
			} catch (error) {
				console.error("🚧 Error manejando mensaje:", error);

				// Si es error de desencriptación, continuar sin romper el bot
				if (
					error.name === "PreKeyError" ||
					error.message?.includes("decrypt")
				) {
					console.log("⚠️ Mensaje no pudo ser desencriptado, continuando...");
				}
			}
		});
	} catch (error) {
		console.error("💥 Error fatal iniciando bot:", error);
		console.log("🔄 Reintentando en 10 segundos...");
		setTimeout(startBot, 10000);
	}
}

// 7. Ejecutar el bot
startBot();
