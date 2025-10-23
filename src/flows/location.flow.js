/**
 * Flujo de ubicación
 */
const { addKeyword } = require("../core/flow");

const locationFlow = addKeyword(["3"], { sensitive: true })
	.addAnswer(
		[
			"📍 *¿CÓMO LLEGAR A ÓPTICA JORVICS?*",
			"",
			"Nuestra dirección es:",
			"Gran Avenida José Miguel Carrera 6483",
			"La Cisterna, Región Metropolitana",
			"",
			"Punto de referencia:",
			"- Estamos cerca al METRO LO OVALLE",
			"",
			"Para ver el mapa en su teléfono, haga clic en este enlace:",
			"https://maps.app.goo.gl/apFHXEmwkMx8tGb18",
		].join("\n")
	)
	.addAction(async (ctx, { sendLocation }) => {
		// Enviar ubicación exacta (coordenadas de ejemplo)
		// Reemplaza con las coordenadas reales de la óptica
		try {
			await sendLocation(
				-33.5288, // latitud
				-70.6631, // longitud
				"Óptica Jorvics - Gran Avenida 6483"
			);
		} catch (error) {
			console.log("No se pudo enviar la ubicación:", error.message);
		}
	});

module.exports = locationFlow;
