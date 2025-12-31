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
			"⚠️ *AVISO IMPORTANTE:* La óptica estará cerrada jueves 1, viernes 2 y sábado 3. El lunes 5 regresamos con normalidad.",
			"",
			"Para obtener información, por favor escriba el NÚMERO de la opción que desea consultar:",
			"",
			"1️⃣  Para conocer nuestros *HORARIOS DE ATENCIÓN*",
			"2️⃣  Para agendar un *CHEQUEO VISUAL GRATUITO*",
			"3️⃣  Para saber *CÓMO LLEGAR* a nuestra óptica",
			"4️⃣  Para ver nuestra *INFORMACIÓN BANCARIA*",
		].join("\n"),
		{ delay: 500 }
	);

module.exports = welcomeFlow;
