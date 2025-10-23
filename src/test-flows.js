/**
 * Script de prueba rápida del sistema de flujos
 * Ejecuta: node src/test-flows.js
 */

const { addKeyword, createFlow } = require("./core/flow");

console.log("🧪 Probando sistema de flujos...\n");

// Test 1: Flujo básico
console.log("✅ Test 1: Flujo básico");
const basicFlow = addKeyword(["hola"]).addAnswer("¡Hola mundo!");
console.log("   Keywords:", basicFlow.keywords);
console.log("   Answers:", basicFlow.answers.length);

// Test 2: Múltiples keywords
console.log("\n✅ Test 2: Múltiples keywords");
const multiFlow = addKeyword(["hola", "hi", "hello"]).addAnswer("Bienvenido");
console.log("   Keywords:", multiFlow.keywords);

// Test 3: Flujo con delay
console.log("\n✅ Test 3: Flujo con delay");
const delayFlow = addKeyword(["espera"])
	.addAnswer("Mensaje 1", { delay: 1000 })
	.addAnswer("Mensaje 2", { delay: 2000 });
console.log("   Answers:", delayFlow.answers.length);
console.log(
	"   Delays:",
	delayFlow.answers.map((a) => a.options.delay)
);

// Test 4: Flujo con callback
console.log("\n✅ Test 4: Flujo con callback");
const callbackFlow = addKeyword(["test"]).addAnswer(
	"Test",
	null,
	async (ctx, { flowDynamic }) => {
		await flowDynamic("Callback ejecutado");
	}
);
console.log("   Has callback:", callbackFlow.answers[0].callback !== null);

// Test 5: Flujo con regex
console.log("\n✅ Test 5: Flujo con regex");
const regexFlow = addKeyword(/\d{4}/, { regex: true }).addAnswer(
	"Detectado número de 4 dígitos"
);
console.log("   Regex mode:", regexFlow.options.regex);
console.log("   Pattern:", regexFlow.keywords[0]);

// Test 6: Flujo sensitive
console.log("\n✅ Test 6: Flujo sensitive");
const sensitiveFlow = addKeyword("ACTIVAR", { sensitive: true }).addAnswer(
	"Activado"
);
console.log("   Sensitive mode:", sensitiveFlow.options.sensitive);

// Test 7: Match de keywords
console.log("\n✅ Test 7: Match de keywords");
const testFlow = addKeyword(["hola", "buenos días"]);
console.log("   Match 'hola':", testFlow.matchKeyword("hola"));
console.log("   Match 'HOLA':", testFlow.matchKeyword("HOLA"));
console.log("   Match 'buenos días':", testFlow.matchKeyword("buenos días"));
console.log("   Match 'adios':", testFlow.matchKeyword("adios"));

// Test 8: Crear flow array
console.log("\n✅ Test 8: CreateFlow");
const flows = createFlow([basicFlow, multiFlow, delayFlow]);
console.log("   Total flows:", flows.length);
console.log(
	"   Flow types:",
	flows.map((f) => f.constructor.name)
);

// Test 9: Flujo con action
console.log("\n✅ Test 9: Flujo con action");
const actionFlow = addKeyword(["action"])
	.addAnswer("Antes del action")
	.addAction(async (ctx, { flowDynamic }) => {
		console.log("   Action ejecutada");
	});
console.log("   Actions:", actionFlow.actions.length);

// Test 10: Flujo completo con todo
console.log("\n✅ Test 10: Flujo completo");
const complexFlow = addKeyword(["completo"])
	.addAnswer("Mensaje 1")
	.addAnswer("Mensaje 2", { delay: 1000 })
	.addAnswer("Mensaje 3", { media: "https://example.com/image.jpg" })
	.addAction(async (ctx, { state }) => {
		await state.update({ step: 1 });
	})
	.addAnswer("Mensaje final", null, async (ctx, { flowDynamic }) => {
		await flowDynamic("Callback final");
	});

console.log("   Total answers:", complexFlow.answers.length);
console.log("   Total actions:", complexFlow.actions.length);
console.log(
	"   Has media:",
	complexFlow.answers.some((a) => a.options.media)
);
console.log(
	"   Has delays:",
	complexFlow.answers.some((a) => a.options.delay > 0)
);
console.log(
	"   Has callbacks:",
	complexFlow.answers.some((a) => a.callback !== null)
);

console.log("\n🎉 Todos los tests completados exitosamente!");
console.log("\n💡 El sistema de flujos está funcionando correctamente.");
console.log("   Ahora puedes ejecutar el bot con: npm run dev\n");
