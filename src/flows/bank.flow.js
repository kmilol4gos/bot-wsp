/**
 * Flujo de información bancaria
 */
const { addKeyword } = require("../core/flow");

const bankFlow = addKeyword(["4"], { sensitive: true }).addAnswer(
	[
		"💳 *INFORMACIÓN BANCARIA*",
		"",
		"Estos son nuestros datos bancarios para transferencias:",
		"",
		"- Banco: Scotiabank",
		"- Nombre: Victor Moraga Pino",
		"- RUT: 4.882.101-4",
		"- Tipo: Cuenta Corriente",
		"- Número: 57015829",
		"- Correo: jorvics6483@gmail.com",
		"",
		"Por favor, después de realizar su transferencia, envíenos el comprobante por este mismo WhatsApp.",
	].join("\n")
);

module.exports = bankFlow;
