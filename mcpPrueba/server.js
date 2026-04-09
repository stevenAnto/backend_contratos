import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
    ListToolsRequestSchema,
    CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fs from "fs"

// Logger a archivo
const logFile = fs.createWriteStream("/tmp/terapias-mcp.log", { flags: "a" })
const log = (...args) => {
    const line = `[${new Date().toISOString()}] ${args.map(a => 
        typeof a === "object" ? JSON.stringify(a) : a
    ).join(" ")}\n`
    logFile.write(line)
    process.stderr.write(line)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, ".env") })

/* CONECTAR A MONGODB */
await mongoose.connect(process.env.MONGO_URI)
    .then(() => log("✅ MongoDB conectado"))
    .catch(err => {
        log("❌ Error conectando a MongoDB:", err.message)
        process.exit(1)
    })

/* IMPORTAR TOOLS (después de conectar) */
const { tools } = await import("./mcp/terapias_tools.js")
log("🔧 Tools cargadas:", tools.map(t => t.name))

const server = new Server(
    { name: "terapias-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
)

/* LISTAR TOOLS */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("📋 ListTools solicitado")
    return {
        tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.parameters
        }))
    }
})

/* EJECUTAR TOOL */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    log("⚙️ CallTool recibido:", request.params.name)
    log("📥 Args:", request.params.arguments)

    const tool = tools.find(t => t.name === request.params.name)

    if (!tool) {
        log("❌ Tool no encontrada:", request.params.name)
        return { content: [{ type: "text", text: `Tool ${request.params.name} no encontrada` }] }
    }

    const result = await tool.execute(request.params.arguments)
    log("📤 Resultado:", result)

    return {
        content: [{ type: "text", text: JSON.stringify(result) }]
    }
})

/* INICIAR MCP */
const transport = new StdioServerTransport()
await server.connect(transport)
log("🚀 Servidor MCP iniciado")