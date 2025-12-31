/**
 * Flujo de chequeo visual
 */
const { addKeyword } = require("../core/flow");

const visualCheckFlow = addKeyword(["2"], { sensitive: true }).addAnswer(
	[
		"👁️ *CHEQUEO VISUAL GRATUITO*",
		"",
		"Le ofrecemos un chequeo visual sin costo al comprar sus lentes.",
		"",
		"Horarios para chequeos:",
		"- Lunes a Viernes:",
		"  Mañana: 11:30 AM a 1:30 PM",
		"  Tarde: 3:30 PM a 6:00 PM",
		"⚠️ *AVISO:* La óptica estará cerrada jueves 1, viernes 2 y sábado 3. El lunes 5 regresamos con normalidad.",
		"",
	].join("\n")
);

module.exports = visualCheckFlow;
