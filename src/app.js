/**
 * Bot de WhatsApp - Arquitectura inspirada en BuilderBot
 * Implementación con Baileys
 *
 * Características:
 * - Sistema de flujos modulares con addKeyword y addAnswer
 * - Gestión de estado por usuario
 * - Callbacks y acciones personalizadas
 * - Delays y mensajes consecutivos
 * - Arquitectura limpia y escalable
 */

const BaileysProvider = require("./provider/baileys.provider");
const BotCore = require("./core/bot");
const { createFlow } = require("./core/flow");

// Importar todos los flujos
const welcomeFlow = require("./flows/welcome.flow");
const hoursFlow = require("./flows/hours.flow");
const visualCheckFlow = require("./flows/visual-check.flow");
const locationFlow = require("./flows/location.flow");
const bankFlow = require("./flows/bank.flow");
const thanksFlow = require("./flows/thanks.flow");

/**
 * Función principal para iniciar el bot
 */
async function main() {
	console.log("🤖 Iniciando Bot de WhatsApp...");
	console.log("📦 Arquitectura: BuilderBot + Baileys");
	console.log(
		"================================================================"
	);

	try {
		// 1. Crear todos los flujos
		const flows = createFlow([
			welcomeFlow,
			hoursFlow,
			visualCheckFlow,
			locationFlow,
			bankFlow,
			thanksFlow,
		]);

		console.log(`✅ ${flows.length} flujos cargados correctamente`);

		// 2. Inicializar el proveedor de Baileys
		const provider = new BaileysProvider();

		// 3. Conectar a WhatsApp
		await provider.connect((sock) => {
			console.log(
				"================================================================"
			);
			console.log("🚀 Bot iniciado correctamente");
			console.log("📱 Esperando mensajes...");
			console.log(
				"================================================================"
			);

			// 4. Crear el core del bot con los flujos
			const bot = new BotCore(sock, flows);

			// 5. Iniciar el listener de mensajes
			bot.start();

			// Opcional: Exponer la API del bot para uso externo
			global.bot = bot;
		});
	} catch (error) {
		console.error("❌ Error iniciando el bot:", error);
		process.exit(1);
	}
}

// Ejecutar el bot
main();
