/**
 * Flujo de horarios de atención
 */
const { addKeyword } = require("../core/flow");

const hoursFlow = addKeyword(["1"], { sensitive: true }).addAnswer(
	[
		"🕐 *HORARIOS DE ATENCIÓN*",
		"",
		"Entre semana:",
		"- De Lunes a Viernes",
		"- Mañana: 10:00 AM a 2:00 PM",
		"- Tarde: 3:00 PM a 7:00 PM",
		"",
		"⚠️ *AVISO IMPORTANTE:*",
		"La óptica estará cerrada jueves 1, viernes 2 y sábado 3.",
		"El lunes 5 regresamos con normalidad.",
		"",
		"Si necesita otra información, puede escribir otro número de las opciones anteriores.",
	].join("\n")
);

module.exports = hoursFlow;
