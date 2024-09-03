const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const Boom = require('@hapi/boom');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== 401);
            if (shouldReconnect) {
                console.log('Reconectando...');
                startBot();
            }
        } else if (connection === 'open') {
            console.log('Conectado exitosamente a WhatsApp');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (messageContent) {
            if (messageContent.toLowerCase() === 'hola') {
                await sock.sendMessage(sender, { text: '¡Hola! ¿Cómo puedo ayudarte?' });
            } else {
                await sock.sendMessage(sender, { text: `Gracias por tu mensaje: "${messageContent}"` });
            }
        }
    });
}

startBot();
