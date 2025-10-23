/**
 * EJEMPLO: Flujo con callback y acciones
 *
 * Este archivo muestra cómo crear flujos más avanzados con:
 * - Callbacks para lógica personalizada
 * - Acciones sin enviar mensajes
 * - Delays entre mensajes
 * - Uso del estado del usuario
 */

const { addKeyword } = require("../core/flow");

// Ejemplo 1: Flujo con callback y flowDynamic
const calculatorFlow = addKeyword(["calcular", "sumar"])
	.addAnswer("🧮 *Calculadora*", null, async (ctx, { flowDynamic }) => {
		await flowDynamic("Por favor, escribe dos números separados por espacio");
		await flowDynamic("Ejemplo: 5 10");
	})
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		const numbers = ctx.body.split(" ");

		if (numbers.length !== 2) {
			await flowDynamic("❌ Error: Debes escribir exactamente dos números");
			return;
		}

		const num1 = parseFloat(numbers[0]);
		const num2 = parseFloat(numbers[1]);

		if (isNaN(num1) || isNaN(num2)) {
			await flowDynamic("❌ Error: Ambos valores deben ser números");
			return;
		}

		const sum = num1 + num2;

		// Guardar en el estado
		await state.update({
			lastCalculation: sum,
			lastNumbers: [num1, num2],
		});

		await flowDynamic(`✅ Resultado: ${num1} + ${num2} = ${sum}`);
	});

// Ejemplo 2: Flujo con delays y mensajes consecutivos
const delayedFlow = addKeyword(["espera", "delay"])
	.addAnswer("⏱️ Voy a enviar varios mensajes con delays...")
	.addAnswer("Mensaje 1", { delay: 1000 })
	.addAnswer("Mensaje 2", { delay: 2000 })
	.addAnswer("Mensaje 3", { delay: 3000 })
	.addAnswer("¡Listo! 🎉");

// Ejemplo 3: Flujo con imagen
const imageFlow = addKeyword(["imagen", "foto", "photo"])
	.addAnswer("📸 Aquí tienes una imagen de ejemplo:")
	.addAnswer("Esta es la descripción de la imagen", {
		media: "https://i.imgur.com/0HpzsEm.png",
		delay: 500,
	});

// Ejemplo 4: Flujo con regex
const emailFlow = addKeyword(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
	regex: true,
}).addAnswer(
	"📧 He detectado que enviaste un email",
	null,
	async (ctx, { flowDynamic, state }) => {
		const email = ctx.body;
		await state.update({ userEmail: email });
		await flowDynamic(`Tu email es: ${email}`);
		await flowDynamic("¡Guardado correctamente!");
	}
);

// Ejemplo 5: Flujo sensible (palabra exacta)
const exactFlow = addKeyword("ACTIVAR", { sensitive: true }).addAnswer(
	"🔓 Comando ACTIVAR ejecutado",
	null,
	async (ctx, { flowDynamic }) => {
		await flowDynamic(
			"Este comando solo funciona con la palabra exacta ACTIVAR"
		);
		await flowDynamic("Si escribes 'activar' en minúsculas, no funcionará");
	}
);

// Ejemplo 6: Flujo con múltiples acciones
const complexFlow = addKeyword(["registro", "registrar"])
	.addAnswer("📝 *Proceso de Registro*")
	.addAnswer("Por favor, indícame tu nombre:")
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		const name = ctx.body;
		await state.update({ userName: name });
		await flowDynamic(`Hola ${name}! Ahora dime tu email:`);
	})
	.addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
		const email = ctx.body;
		await state.update({ userEmail: email });

		const userData = state.get();

		await flowDynamic("✅ *Registro completado*");
		await flowDynamic(`Nombre: ${userData.userName}`);
		await flowDynamic(`Email: ${userData.userEmail}`);
	});

module.exports = {
	calculatorFlow,
	delayedFlow,
	imageFlow,
	emailFlow,
	exactFlow,
	complexFlow,
};
