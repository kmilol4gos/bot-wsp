/**
 * bot.js
 *
 * Versión completa del bot de WhatsApp con Baileys, preparada para:
 * 1. Persistir credenciales en ./auth_info
 * 2. Mostrar QR en terminal la primera vez
 * 3. Manejar correctamente DisconnectReason
 * 4. Detectar errores de WebSocket/TLS (stream:error code='515')
 * 5. Conectarse con un nombre de navegador claro
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

// Función para manejar mensajes entrantes
async function handleMessage(sock, sender, messageContent) {
    const lowerCaseMessage = messageContent.toLowerCase();

    // Responder saludos básicos con expresiones regulares
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
            // Aquí puedes agregar un mensaje por defecto si lo deseas
            break;
    }
}

// Función para enviar el mensaje de bienvenida
async function sendWelcomeMessage(sock, sender) {
    const replyMessage = `🙌 Hola, bienvenido/a, soy *Optibot*, asistente virtual de *Óptica Jorvics* 👓
¿En qué puedo ayudarte hoy?

1️⃣  *Horario de atención* 🕞
2️⃣  *Chequeo visual* 👁️ 
3️⃣  *Dónde estamos* 📍
4️⃣  *Cuenta bancaria* 💳`;
    await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de horario de atención
async function sendOpeningHours(sock, sender) {
    const replyMessage = `🕞 *Horario de atención*
- Lunes a Viernes: 10:00 - 14:00 hrs y 15:00 - 19:00 hrs
- Sábados (días 14 y 28 de junio): 10:00 - 14:00 hrs`;
    await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de chequeo visual
async function sendVisualCheckMessage(sock, sender) {
    const replyMessage = `👁️ *Chequeo visual* gratuito por la compra de sus lentes ópticos!
- Horario de chequeo: 11:30 - 13:30 y 15:30 - 18:00 hrs
- Sábado 14 y 28 de junio: 10:00 - 14:00 hrs
Para agendar su chequeo, escríbanos por WhatsApp o llámenos 🔴`;
    await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de la ubicación
async function sendLocationMessage(sock, sender) {
    const replyMessage = `📍 *Dónde estamos*
Gran Av. José Miguel Carrera 6483, METRO LO OVALLE, La Cisterna, Región Metropolitana.
Mapa: https://maps.app.goo.gl/apFHXEmwkMx8tGb18`;
    await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar el mensaje de la cuenta bancaria
async function sendBankAccountMessage(sock, sender) {
    const replyMessage = `💳 *Cuenta bancaria*
Scotiabank
RUT: 4.882.101-4
Correo: jorvics6483@gmail.com
Titular: Victor Moraga Pino
Tipo de Cuenta: Cuenta Corriente
Número: 57015829`;
    await sock.sendMessage(sender, { text: replyMessage });
}

// Función para enviar un mensaje de agradecimiento
async function sendThanksMessage(sock, sender) {
    const replyMessage = `🙏 ¡De nada! Si necesitas algo más, estoy aquí para ayudarte.`;
    await sock.sendMessage(sender, { text: replyMessage });
}

// Función principal: inicializa el socket y maneja reconexiones
async function startBot() {
    // Crear o cargar estado de autenticación en ./auth_info
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    // Crear el socket de WhatsApp
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,                            // Mostrar QR la primera vez
        browser: Browsers.macOS("Optibot-Baileys"),          // Nombre arbitrario para el navegador
        // syncFullHistory: true,                           // Opcional, si necesitas historial completo
    });

    // Guardar credenciales cada vez que se actualicen
    sock.ev.on("creds.update", saveCreds);

    // Manejo de actualizaciones de conexión
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Si viene un QR, imprimirlo en consola
        if (qr) {
            console.log("⏳ Escanea este código QR con tu WhatsApp (MD):");
            qrcode.generate(qr, { small: true });
        }

        // Cuando la conexión se cierra
        if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log("❌ Conexión cerrada. Código de status:", statusCode);
            console.log("Detalle último error:", JSON.stringify(lastDisconnect, null, 2));

            // Si no se cerró por logout (status 401), reintentar
            if (statusCode !== DisconnectReason.loggedOut) {
                console.log("🔄 Intentando reconectar en 5 segundos...");
                setTimeout(startBot, 5000);
            } else {
                console.log("🚫 Sesión cerrada permanentemente (loggedOut).");
                console.log("   - Para generar un nuevo QR, elimina la carpeta ./auth_info y reinicia el bot.");
            }
        }

        // Cuando la conexión se abre
        if (connection === "open") {
            console.log("✅ Conectado exitosamente a WhatsApp");
        }
    });

    // Manejar errores de WebSocket/TLS (por ejemplo: stream:error code='515')
    sock.ws.on("CB:stream:error", (err) => {
        console.error("⚠️ Error de stream:", err);
        if (err?.code === "515") {
            console.log("🚨 Error 515 detectado: reiniciando conexión en 5 segundos...");
            setTimeout(startBot, 5000);
        }
    });

    // Escuchar mensajes entrantes
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

// Ejecutar el bot
startBot();
