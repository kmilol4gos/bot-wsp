/**
 * Servidor HTTP API (Opcional)
 *
 * Este módulo añade un servidor HTTP para:
 * - Enviar mensajes vía API REST
 * - Webhook para eventos
 * - Panel de administración básico
 */

const http = require("http");
const url = require("url");

class HttpServer {
	constructor(bot, port = 3000) {
		this.bot = bot;
		this.port = port;
		this.server = null;
	}

	/**
	 * Parsea el body de una petición POST
	 */
	async parseBody(req) {
		return new Promise((resolve, reject) => {
			let body = "";
			req.on("data", (chunk) => {
				body += chunk.toString();
			});
			req.on("end", () => {
				try {
					resolve(JSON.parse(body));
				} catch (e) {
					resolve({});
				}
			});
			req.on("error", reject);
		});
	}

	/**
	 * Maneja las peticiones HTTP
	 */
	async handleRequest(req, res) {
		const parsedUrl = url.parse(req.url, true);
		const pathname = parsedUrl.pathname;

		// Configurar CORS
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");

		if (req.method === "OPTIONS") {
			res.writeHead(200);
			res.end();
			return;
		}

		try {
			// Ruta: POST /v1/messages - Enviar mensaje
			if (pathname === "/v1/messages" && req.method === "POST") {
				const body = await this.parseBody(req);
				const { number, message, media } = body;

				if (!number || !message) {
					res.writeHead(400, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							success: false,
							error: "Missing number or message",
						})
					);
					return;
				}

				// Enviar mensaje a través del bot
				await this.bot.sendMessage(number, message, { media });

				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(
					JSON.stringify({
						success: true,
						message: "Message sent successfully",
					})
				);
				return;
			}

			// Ruta: GET /health - Health check
			if (pathname === "/health" && req.method === "GET") {
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(
					JSON.stringify({
						status: "ok",
						uptime: process.uptime(),
						timestamp: new Date().toISOString(),
					})
				);
				return;
			}

			// Ruta: GET /state/:userId - Obtener estado de un usuario
			if (pathname.startsWith("/state/") && req.method === "GET") {
				const userId = pathname.split("/")[2];
				const state = this.bot.stateManager.get(userId);

				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify(state));
				return;
			}

			// Ruta: GET / - Página principal
			if (pathname === "/" && req.method === "GET") {
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WhatsApp Bot API</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #25D366; }
        code { 
            background: #f4f4f4; 
            padding: 2px 6px; 
            border-radius: 3px;
            font-size: 14px;
        }
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .endpoint {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #25D366;
            background: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 WhatsApp Bot API</h1>
        <p>Bot activo y funcionando correctamente</p>
        
        <h2>📡 Endpoints disponibles</h2>
        
        <div class="endpoint">
            <h3>POST /v1/messages</h3>
            <p>Enviar mensaje a un número de WhatsApp</p>
            <pre><code>{
  "number": "56912345678",
  "message": "Hola desde la API!",
  "media": "https://url-imagen.jpg" // opcional
}</code></pre>
        </div>

        <div class="endpoint">
            <h3>GET /health</h3>
            <p>Verificar estado del servidor</p>
        </div>

        <div class="endpoint">
            <h3>GET /state/:userId</h3>
            <p>Obtener el estado guardado de un usuario</p>
        </div>

        <h2>🚀 Ejemplo con cURL</h2>
        <pre><code>curl -X POST http://localhost:${this.port}/v1/messages \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "56912345678",
    "message": "Hola desde cURL!"
  }'</code></pre>

        <h2>📝 Ejemplo con JavaScript</h2>
        <pre><code>fetch('http://localhost:${this.port}/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: '56912345678',
    message: 'Hola desde JavaScript!'
  })
})
.then(res => res.json())
.then(data => console.log(data));</code></pre>
    </div>
</body>
</html>
                `);
				return;
			}

			// Ruta no encontrada
			res.writeHead(404, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Route not found" }));
		} catch (error) {
			console.error("Error handling request:", error);
			res.writeHead(500, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Internal server error" }));
		}
	}

	/**
	 * Inicia el servidor HTTP
	 */
	start() {
		this.server = http.createServer((req, res) => this.handleRequest(req, res));

		this.server.listen(this.port, () => {
			console.log(
				"================================================================"
			);
			console.log(`🌐 Servidor HTTP iniciado en http://localhost:${this.port}`);
			console.log(
				`📡 API disponible en http://localhost:${this.port}/v1/messages`
			);
			console.log(
				"================================================================"
			);
		});

		return this.server;
	}

	/**
	 * Detiene el servidor HTTP
	 */
	stop() {
		if (this.server) {
			this.server.close();
		}
	}
}

module.exports = HttpServer;
