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
  Browsers
} = require("@whiskeysockets/baileys"); // v6.6.0
const qrcode = require("qrcode-terminal");

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
  const replyMessage = `🙌 Hola, soy *Optibot* de *Óptica Jorvics* 👓
¿En qué puedo ayudarte?

1️⃣  *Horario de atención* 🕞
2️⃣  *Chequeo visual* 👁️
3️⃣  *Dónde estamos* 📍
4️⃣  *Cuenta bancaria* 💳`;
  await sock.sendMessage(sender, { text: replyMessage });
}

async function sendOpeningHours(sock, sender) {
  const replyMessage = `🕞 *Horario de atención*
- Lunes a Viernes: 10:00 - 14:00 y 15:00 - 19:00 hrs
- Sábado 14 y 28 de junio: 10:00 - 14:00 hrs`;
  await sock.sendMessage(sender, { text: replyMessage });
}

async function sendVisualCheckMessage(sock, sender) {
  const replyMessage = `👁️ *Chequeo visual* gratuito por compra de lentes
- Horario: 11:30 - 13:30 y 15:30 - 18:00 hrs
- Sábado 14 y 28 de junio: 10:00 - 14:00 hrs
Para agendar, contáctanos por WhatsApp o llámanos 🔴`;
  await sock.sendMessage(sender, { text: replyMessage });
}

async function sendLocationMessage(sock, sender) {
  const replyMessage = `📍 *Dónde estamos*
Gran Av. José Miguel Carrera 6483, METRO LO OVALLE, La Cisterna, RM.
Mapa: https://maps.app.goo.gl/apFHXEmwkMx8tGb18`;
  await sock.sendMessage(sender, { text: replyMessage });
}

async function sendBankAccountMessage(sock, sender) {
  const replyMessage = `💳 *Cuenta bancaria*
Scotiabank
RUT: 4.882.101-4
Correo: jorvics6483@gmail.com
Titular: Victor Moraga Pino
Cuenta Corriente: 57015829`;
  await sock.sendMessage(sender, { text: replyMessage });
}

async function sendThanksMessage(sock, sender) {
  const replyMessage = `🙏 ¡De nada! Si necesitas algo más, aquí estoy.`;
  await sock.sendMessage(sender, { text: replyMessage });
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
    printQRInTerminal: true,                  // Mostrar QR la primera vez
    browser: Browsers.macOS("Optibot-Baileys") // Nombre arbitrario/identificable
    // syncFullHistory: true, // Opcional, si necesita recuperar chats previos
  });

  // 3. Guardar credenciales cada vez que Baileys las actualice
  sock.ev.on("creds.update", saveCreds);

  // 4. Manejo de eventos de conexión
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    // 4.1. Si hay QR, imprimir en consola
    if (qr) {
      console.log("⏳ Escanea este código QR con tu WhatsApp (MD):");
      qrcode.generate(qr, { small: true });
    }

    // 4.2. Si la conexión se cierra
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log("❌ Conexión cerrada. Código de status:", statusCode);
      console.log("Detalle del último error:", JSON.stringify(lastDisconnect, null, 2));

      // Si no es logout (401), reintentar en 5 s
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando en 5 segundos...");
        setTimeout(startBot, 5000);
      } else {
        console.log("🚫 Sesión cerrada permanentemente (loggedOut).");
        console.log("   - Para obtener un nuevo QR, elimina ./auth_info y reinicia el bot.");
      }
    }

    // 4.3. Si la conexión se abrió correctamente
    if (connection === "open") {
      console.log("✅ Conectado exitosamente a WhatsApp");
    }
  });

  // 5. Capturar errores de stream (por ejemplo, “515”)
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
      const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;
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
