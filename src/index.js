const {
	default: makeWASocket,
	useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const Boom = require("@hapi/boom");

// Función para manejar mensajes entrantes
async function handleMessage(sock, sender, messageContent) {
	switch (messageContent.toLowerCase()) {
		case "hola":
			await sendWelcomeMessage(sock, sender);
			break;
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
	}
}

// Función para enviar el mensaje de bienvenida
async function sendWelcomeMessage(sock, sender) {
	const replyMessage = `🙌 Hola, bienvenido/a, soy *Optibot* asistente virtual de *Optica Jorvics* 👓
¿En qué puedo ayudarte hoy?

1️⃣ *Horario de atención* 🕞
2️⃣ *Chequeo visual* 👁️
3️⃣ *Donde estamos* 📍
4️⃣ *Cuenta bancaria* 💳
    `;
	await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de horario de atención
async function sendOpeningHours(sock, sender) {
	const replyMessage = `🕞 *Horario de atención*
- Lunes a Viernes: 10:00 a 14:00 hrs y 15:00 a 19:00 hrs
- Sábado: *Por definir*
    `;
	await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de chequeo visual
async function sendVisualCheckMessage(sock, sender) {
	const replyMessage = `👁️ *Chequeo visual* gratuito por la compra de sus lentes opticos!
- Nuestro horario de chequeo visual es de 11:30 - 13:30 y de 15:30 - 17:40
- *Fechas especiales mes de Septiembre:* Por definir 
🔴Para agendar su chequeo visual, escribanos al WhatsApp o Llamenos🔴
    `;
	await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de la ubicación
async function sendLocationMessage(sock, sender) {
	const replyMessage = `📍 *Donde estamos*
stamos ubicados en Gran Av. José Miguel Carrera 6483, METRO LO OVALLE, La Cisterna, Región Metropolitana
Te dejamos nuestro mapa para que puedas llegar sin problemas 🗺️
https://maps.app.goo.gl/apFHXEmwkMx8tGb18
    `;
	await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de la cuenta bancaria
async function sendBankAccountMessage(sock, sender) {
	const replyMessage = `💳 *Cuenta bancaria*
Si necesitas realizar un pago, te dejamos nuestra cuenta:

Scotiabank
4.882.101-4
jorvics6483@gmail.com
Victor Moraga Pino
Cuenta Corriente
57015829
    `;
	await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de agradecimiento
async function sendThanksMessage(sock, sender) {
	const replyMessage = `🙌 Gracias por confiar en *Optica Jorvics* 👓 Recuerda seguirnos en nuestras redes sociales 👌
[*Instagram*] https://www.instagram.com/optica_jorvics/
[*Facebook*] https://web.facebook.com/opticajorvics
Y recuerda dejarnos una linda reseña en Google 🌟
    `;
	await sock.sendMessage(sender, { text: replyMessage });
}

// Función principal para iniciar el bot
async function startBot() {
	const { state, saveCreds } = await useMultiFileAuthState("auth_info");

	const sock = makeWASocket({
		auth: state,
		printQRInTerminal: false,
	});

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", (update) => {
		const { connection, qr, lastDisconnect } = update;
		if (qr) {
			qrcode.generate(qr, { small: true });
		}

		if (connection === "close") {
			const shouldReconnect =
				lastDisconnect.error &&
				lastDisconnect.error.output &&
				lastDisconnect.error.output.statusCode !== 401;
			if (shouldReconnect) {
				console.log("Reconectando...");
				startBot();
			}
		} else if (connection === "open") {
			console.log("Conectado exitosamente a WhatsApp");
		}
	});

	sock.ev.on("messages.upsert", async (m) => {
		const msg = m.messages[0];
		if (!msg.message || msg.key.fromMe) return;

		const sender = msg.key.remoteJid;
		const messageContent =
			msg.message.conversation || msg.message.extendedTextMessage?.text;

		if (messageContent) {
			try {
				await handleMessage(sock, sender, messageContent);
			} catch (error) {
				console.error("Error manejando el mensaje:", error);
			}
		}
	});
}

startBot();
