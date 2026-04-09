import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

export async function createMCPClient() {
    const transport = new StdioClientTransport({
        command: "npx",
        args: [
            "-y",
            "@playwright/mcp@latest"
        ]
    })

    const client = new Client(
        { name: "node-agent", version: "1.0.0" },
        {
            capabilities: {
                tools: {},        // ← declarar que soportamos tools
                resources: {},    // ← y resources (opcional)
            }
        }
    )

    await client.connect(transport)

    const { tools } = await client.listTools()

    // Convertir tools al formato que espera la API de Anthropic
    const anthropicTools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
    }))

    return { client, tools: anthropicTools }
}

export async function callTool(client, toolName, toolInput) {
    const result = await client.callTool({
        name: toolName,
        arguments: toolInput
    })
    return result
}

export async function closeMCPClient(client) {
    await client.close()
}