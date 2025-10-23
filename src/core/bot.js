/**
 * Core del Bot - Manejo de flujos y mensajes
 */
const StateManager = require("./state");

class BotCore {
	constructor(sock, flows) {
		this.sock = sock;
		this.flows = flows || [];
		this.stateManager = new StateManager();
	}

	/**
	 * Crea los helpers para cada mensaje
	 * @param {string} sender - JID del remitente
	 */
	createHelpers(sender) {
		return {
			// Envía mensajes dinámicamente desde callbacks
			flowDynamic: async (message, options = {}) => {
				if (options.delay) {
					await new Promise((resolve) => setTimeout(resolve, options.delay));
				}

				if (options.media) {
					await this.sock.sendMessage(sender, {
						image: { url: options.media },
						caption: message,
					});
				} else {
					await this.sock.sendMessage(sender, { text: message });
				}
			},

			// Gestión de estado
			state: {
				get: () => this.stateManager.get(sender),
				update: (data) => this.stateManager.update(sender, data),
				clear: () => this.stateManager.clear(sender),
				getAll: () => this.stateManager.getAll(),
			},

			// Envía mensajes con formato
			sendMessage: async (message, options = {}) => {
				return await this.sock.sendMessage(sender, {
					text: message,
					...options,
				});
			},

			// Envía imágenes
			sendImage: async (url, caption = "") => {
				return await this.sock.sendMessage(sender, {
					image: { url },
					caption,
				});
			},

			// Envía archivos
			sendFile: async (url, mimetype, fileName) => {
				return await this.sock.sendMessage(sender, {
					document: { url },
					mimetype,
					fileName,
				});
			},

			// Envía ubicación
			sendLocation: async (latitude, longitude, name = "") => {
				return await this.sock.sendMessage(sender, {
					location: {
						degreesLatitude: latitude,
						degreesLongitude: longitude,
						name,
					},
				});
			},
		};
	}

	/**
	 * Procesa un mensaje entrante
	 * @param {Object} msg - Mensaje de Baileys
	 */
	async handleMessage(msg) {
		try {
			// Ignorar mensajes del bot mismo o sin contenido
			if (!msg.message || msg.key.fromMe) return;

			const sender = msg.key.remoteJid;
			const messageContent =
				msg.message.conversation || msg.message.extendedTextMessage?.text || "";

			// Crear contexto del mensaje
			const ctx = {
				body: messageContent,
				from: sender,
				message: msg.message,
				key: msg.key,
				pushName: msg.pushName || "",
			};

			// Crear helpers
			const helpers = this.createHelpers(sender);

			// Buscar flujo que coincida
			let matchedFlow = null;

			for (const flow of this.flows) {
				if (flow.matchKeyword(messageContent)) {
					matchedFlow = flow;
					break;
				}
			}

			// Ejecutar flujo si se encontró coincidencia
			if (matchedFlow) {
				await matchedFlow.execute(this.sock, sender, ctx, helpers);
			}
		} catch (error) {
			console.error("🚧 Error procesando mensaje:", error);
		}
	}

	/**
	 * Inicia el listener de mensajes
	 */
	start() {
		this.sock.ev.on("messages.upsert", async (m) => {
			for (const msg of m.messages) {
				await this.handleMessage(msg);
			}
		});
	}

	/**
	 * Envía un mensaje a un número específico (útil para API)
	 * @param {string} number - Número de teléfono
	 * @param {string} message - Mensaje a enviar
	 * @param {Object} options - Opciones adicionales
	 */
	async sendMessage(number, message, options = {}) {
		// Formatear número si es necesario
		const jid = number.includes("@") ? number : `${number}@s.whatsapp.net`;

		if (options.media) {
			return await this.sock.sendMessage(jid, {
				image: { url: options.media },
				caption: message,
			});
		}

		return await this.sock.sendMessage(jid, { text: message });
	}
}

module.exports = BotCore;
