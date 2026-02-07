/**
 * Flujo de bienvenida
 */
const { addKeyword } = require("../core/flow");

const welcomeFlow = addKeyword([
	"hola",
	"buenos días",
	"buenas tardes",
	"hi",
	"hello",
])
	.addAnswer("👋 Bienvenido(a) a *Óptica Jorvics*")
	.addAnswer(
		[
			"Soy su asistente virtual y estoy aquí para ayudarle.",
			"",
			"🏖️ *AVISO IMPORTANTE:* Estaremos de vacaciones del 9 al 16 de febrero. Regresamos el martes 17 de febrero.",
			"",
			"Para obtener información, por favor escriba el NÚMERO de la opción que desea consultar:",
			"",
			"1️⃣  Para conocer nuestros *HORARIOS DE ATENCIÓN*",
			"2️⃣  Para agendar un *CHEQUEO VISUAL GRATUITO*",
			"3️⃣  Para saber *CÓMO LLEGAR* a nuestra óptica",
			"4️⃣  Para ver nuestra *INFORMACIÓN BANCARIA*",
		].join("\n"),
		{ delay: 500 },
	);

module.exports = welcomeFlow;
