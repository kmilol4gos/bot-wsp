/**
 * Flujo de agradecimiento
 */
const { addKeyword } = require("../core/flow");

const thanksFlow = addKeyword([
	"gracias",
	"muchas gracias",
	"thank you",
	"thanks",
]).addAnswer(
	[
		"🙏 ¡Gracias por contactarnos!",
		"",
		"Recuerde que puede escribir cualquier número del 1 al 4 si necesita más información.",
		"",
		"¡Que tenga un excelente día!",
	].join("\n")
);

module.exports = thanksFlow;
