/**
 * Sistema de Flujos inspirado en BuilderBot
 * Implementación con Baileys
 */

class Flow {
	constructor(keywords = [], options = {}) {
		this.keywords = Array.isArray(keywords) ? keywords : [keywords];
		this.options = {
			regex: options.regex || false,
			sensitive: options.sensitive || false,
		};
		this.answers = [];
		this.actions = [];
		this.childFlows = [];
	}

	/**
	 * Agrega una respuesta al flujo
	 * @param {string|string[]} message - Mensaje o array de mensajes
	 * @param {Object} options - Opciones (delay, media, capture, buttons)
	 * @param {Function} callback - Función callback opcional
	 */
	addAnswer(message, options = {}, callback = null) {
		// Si options es null o undefined, usar objeto vacío
		if (!options || typeof options !== "object") {
			options = {};
		}

		const answer = {
			message: Array.isArray(message) ? message.join("\n") : message,
			options: {
				delay: options.delay || 0,
				media: options.media || null,
				capture: options.capture || false,
				buttons: options.buttons || null,
			},
			callback: callback,
		};
		this.answers.push(answer);
		return this;
	}

	/**
	 * Agrega una acción al flujo (ejecuta código sin enviar mensaje)
	 * @param {Object|Function} optionsOrCallback - Opciones o callback directo
	 * @param {Function} callback - Callback si el primer parámetro son opciones
	 */
	addAction(optionsOrCallback, callback = null) {
		let action;

		if (typeof optionsOrCallback === "function") {
			action = {
				options: { capture: false },
				callback: optionsOrCallback,
			};
		} else {
			action = {
				options: optionsOrCallback || {},
				callback: callback,
			};
		}

		this.actions.push(action);
		return this;
	}

	/**
	 * Verifica si un mensaje coincide con las palabras clave del flujo
	 * @param {string} message - Mensaje a verificar
	 */
	matchKeyword(message) {
		if (!message) return false;

		const messageToCheck = this.options.sensitive
			? message
			: message.toLowerCase();

		if (this.options.regex) {
			// Si es regex, verificar con cada patrón
			return this.keywords.some((keyword) => {
				if (keyword instanceof RegExp) {
					return keyword.test(message);
				}
				return false;
			});
		}

		// Verificación normal de palabras clave
		return this.keywords.some((keyword) => {
			const keywordToCheck = this.options.sensitive
				? keyword
				: keyword.toLowerCase();

			if (this.options.sensitive) {
				// Modo sensible: el mensaje debe ser exactamente igual
				return messageToCheck === keywordToCheck;
			} else {
				// Modo normal: la palabra clave puede estar en cualquier parte
				return messageToCheck.includes(keywordToCheck);
			}
		});
	}

	/**
	 * Ejecuta el flujo para un usuario específico
	 * @param {Object} sock - Socket de Baileys
	 * @param {string} sender - JID del remitente
	 * @param {Object} ctx - Contexto del mensaje
	 * @param {Object} helpers - Helpers (flowDynamic, state, etc)
	 */
	async execute(sock, sender, ctx, helpers) {
		// Ejecutar todas las respuestas
		for (const answer of this.answers) {
			if (answer.options.delay > 0) {
				await new Promise((resolve) =>
					setTimeout(resolve, answer.options.delay)
				);
			}

			// Enviar mensaje si existe
			if (answer.message) {
				if (answer.options.media) {
					// Enviar imagen
					await sock.sendMessage(sender, {
						image: { url: answer.options.media },
						caption: answer.message,
					});
				} else if (answer.options.buttons) {
					// Enviar con botones
					await sock.sendMessage(sender, {
						text: answer.message,
						buttons: answer.options.buttons,
						headerType: 1,
					});
				} else {
					// Enviar texto simple
					await sock.sendMessage(sender, { text: answer.message });
				}
			}

			// Ejecutar callback si existe
			if (answer.callback) {
				await answer.callback(ctx, helpers);
			}
		}

		// Ejecutar todas las acciones
		for (const action of this.actions) {
			if (action.callback) {
				await action.callback(ctx, helpers);
			}
		}
	}
}

/**
 * Crea un nuevo flujo con palabras clave
 * @param {string|string[]|RegExp} keywords - Palabra(s) clave o expresión regular
 * @param {Object} options - Opciones del flujo
 */
function addKeyword(keywords, options = {}) {
	return new Flow(keywords, options);
}

/**
 * Crea el manejador de flujos
 * @param {Array<Flow>} flows - Array de flujos
 */
function createFlow(flows) {
	return flows;
}

module.exports = {
	Flow,
	addKeyword,
	createFlow,
};
