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
		"Días especiales de Enero:",
		"- Sábado 10 y Sábado 24",
		"- Horario: 10:00 AM a 2:00 PM",
		"",
		"Si necesita otra información, puede escribir otro número de las opciones anteriores.",
	].join("\n")
);

module.exports = hoursFlow;
