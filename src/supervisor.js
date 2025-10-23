/**
 * Script de inicio con manejo de errores para producción
 * Reinicia automáticamente el bot si hay fallos
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuración
const MAX_RESTARTS = 10;
const RESTART_DELAY = 5000; // 5 segundos
const LOG_DIR = path.join(__dirname, "../logs");

let restartCount = 0;
let lastRestartTime = Date.now();

// Crear directorio de logs si no existe
if (!fs.existsSync(LOG_DIR)) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Función para escribir logs
function log(message, level = "INFO") {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] [${level}] ${message}\n`;

	console.log(logMessage.trim());

	// Guardar en archivo
	const logFile = path.join(
		LOG_DIR,
		`bot-${new Date().toISOString().split("T")[0]}.log`
	);
	fs.appendFileSync(logFile, logMessage);
}

// Función para iniciar el bot
function startBot() {
	log("🚀 Iniciando bot de WhatsApp...");

	const bot = spawn("node", ["src/app.js"], {
		cwd: path.join(__dirname, ".."),
		stdio: ["inherit", "pipe", "pipe"],
	});

	// Manejar salida estándar
	bot.stdout.on("data", (data) => {
		process.stdout.write(data);
		// Opcional: guardar en logs
		fs.appendFileSync(
			path.join(LOG_DIR, `bot-${new Date().toISOString().split("T")[0]}.log`),
			data
		);
	});

	// Manejar errores
	bot.stderr.on("data", (data) => {
		process.stderr.write(data);
		log(data.toString().trim(), "ERROR");
	});

	// Manejar cierre del proceso
	bot.on("close", (code) => {
		const now = Date.now();
		const timeSinceLastRestart = now - lastRestartTime;

		log(`❌ Bot cerrado con código: ${code}`, "WARN");

		// Resetear contador si pasó más de 1 minuto
		if (timeSinceLastRestart > 60000) {
			restartCount = 0;
		}

		// Verificar si debemos reiniciar
		if (code !== 0 && restartCount < MAX_RESTARTS) {
			restartCount++;
			lastRestartTime = now;

			log(
				`🔄 Reiniciando bot (intento ${restartCount}/${MAX_RESTARTS}) en ${
					RESTART_DELAY / 1000
				}s...`,
				"INFO"
			);

			setTimeout(startBot, RESTART_DELAY);
		} else if (restartCount >= MAX_RESTARTS) {
			log(
				`🚨 Máximo de reinicios alcanzado (${MAX_RESTARTS}). Deteniendo bot.`,
				"ERROR"
			);
			process.exit(1);
		} else {
			log("✅ Bot cerrado exitosamente", "INFO");
			process.exit(0);
		}
	});

	// Manejar señales del sistema
	process.on("SIGINT", () => {
		log("📡 Señal SIGINT recibida. Cerrando bot...", "INFO");
		bot.kill("SIGINT");
	});

	process.on("SIGTERM", () => {
		log("📡 Señal SIGTERM recibida. Cerrando bot...", "INFO");
		bot.kill("SIGTERM");
	});
}

// Iniciar el bot
log("=".repeat(60));
log("WhatsApp Bot - Proceso de supervisión iniciado");
log("=".repeat(60));

startBot();
