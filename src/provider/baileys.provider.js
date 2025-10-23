/**
 * Proveedor de Baileys - Manejo de conexión a WhatsApp
 */
const {
	default: makeWASocket,
	useMultiFileAuthState,
	DisconnectReason,
	Browsers,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");

class BaileysProvider {
	constructor() {
		this.sock = null;
		this.qrHandler = null;
	}

	/**
	 * Muestra el código QR para escanear
	 * @param {string} qr - Código QR
	 */
	displayQR(qr) {
		console.log("⏳ Escanea este código QR con tu WhatsApp:");
		console.log(
			"================================================================"
		);

		// Método 1: Generar URL de imagen QR
		try {
			const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
				qr
			)}`;
			console.log(
				"🖼️  CÓDIGO QR COMO IMAGEN (copia esta URL en tu navegador):"
			);
			console.log(qrImageUrl);
			console.log(
				"================================================================"
			);
		} catch (e) {
			console.log("Error generando URL de QR:", e);
		}

		// Método 2: Mostrar QR en terminal
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
						console.log("📱 QR en terminal:");
						console.log(qrString);
					}
					console.log(
						"================================================================"
					);
					console.log("📱 Instrucciones:");
					console.log("   1. Abre WhatsApp en tu teléfono");
					console.log("   2. Ve a Configuración > Dispositivos vinculados");
					console.log("   3. Toca 'Vincular un dispositivo'");
					console.log("   4. Escanea el código QR de arriba");
					console.log(
						"================================================================"
					);
				}
			);
		} catch (e) {
			console.log("Error con QR en terminal:", e);
		}

		// Llamar handler personalizado si existe
		if (this.qrHandler) {
			this.qrHandler(qr);
		}
	}

	/**
	 * Inicializa la conexión con WhatsApp
	 * @param {Function} onReady - Callback cuando la conexión está lista
	 */
	async connect(onReady) {
		// Cargar o crear estado de autenticación
		const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

		// Crear socket de Baileys
		this.sock = makeWASocket({
			auth: state,
			browser: Browsers.macOS("BuilderBot-Baileys"),
			printQRInTerminal: false, // Manejamos el QR manualmente
			// Configuración adicional para evitar error 405
			syncFullHistory: false,
			markOnlineOnConnect: true,
			generateHighQualityLinkPreview: false,
			defaultQueryTimeoutMs: 60000,
		});

		// Guardar credenciales
		this.sock.ev.on("creds.update", saveCreds);

		// Manejo de conexión
		this.sock.ev.on("connection.update", async (update) => {
			const { connection, lastDisconnect, qr } = update;

			// Mostrar QR si está disponible
			if (qr) {
				this.displayQR(qr);
			}

			// Conexión cerrada
			if (connection === "close") {
				const statusCode = lastDisconnect?.error?.output?.statusCode;
				console.log("❌ Conexión cerrada. Código:", statusCode);

				// Manejar diferentes códigos de error
				if (statusCode === 405) {
					console.log("\n⚠️  ERROR 405: Sesión inválida o bloqueada");
					console.log("� Soluciones:");
					console.log("   1. Ejecuta: npm run clean");
					console.log("   2. Reinicia el bot: npm run dev");
					console.log("   3. Escanea un nuevo código QR");
					console.log("\n💡 Si el problema persiste:");
					console.log(
						"   - Verifica que WhatsApp esté actualizado en tu teléfono"
					);
					console.log("   - Espera 5-10 minutos antes de intentar nuevamente");
					console.log(
						"   - WhatsApp puede haber bloqueado temporalmente este número\n"
					);
					process.exit(1);
				} else if (statusCode === DisconnectReason.loggedOut) {
					console.log("🚫 Sesión cerrada permanentemente.");
					console.log(
						"   - Elimina ./auth_info y reinicia el bot para obtener un nuevo QR."
					);
					process.exit(1);
				} else if (statusCode === DisconnectReason.restartRequired) {
					console.log("🔄 Reinicio requerido, reconectando...");
					setTimeout(() => this.connect(onReady), 2000);
				} else if (statusCode === DisconnectReason.timedOut) {
					console.log("⏱️  Tiempo de espera agotado, reconectando...");
					setTimeout(() => this.connect(onReady), 3000);
				} else {
					console.log("🔄 Reconectando en 5 segundos...");
					setTimeout(() => this.connect(onReady), 5000);
				}
			}

			// Conexión abierta
			if (connection === "open") {
				console.log("✅ Conectado exitosamente a WhatsApp");
				if (onReady) {
					onReady(this.sock);
				}
			}
		});

		// Manejo de errores de stream
		this.sock.ws.on("CB:stream:error", (err) => {
			console.error("⚠️ Error de stream:", err);
			if (err?.code === "515") {
				console.log("🚨 Error 515: reiniciando en 5s...");
				setTimeout(() => this.connect(onReady), 5000);
			}
		});

		return this.sock;
	}

	/**
	 * Obtiene el socket actual
	 */
	getSocket() {
		return this.sock;
	}

	/**
	 * Registra un handler personalizado para el QR
	 * @param {Function} handler - Función que recibe el QR
	 */
	onQR(handler) {
		this.qrHandler = handler;
	}
}

module.exports = BaileysProvider;
