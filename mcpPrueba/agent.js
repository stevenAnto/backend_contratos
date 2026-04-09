import "dotenv/config"
import OpenAI from "openai"
import { createMCPClient, callTool, closeMCPClient } from "./mcpCliente.js"
import { tools } from "./mcp/terapiasTools.js"

const openai = new OpenAI() // usa OPENAI_API_KEY del env

export async function runAgent(userMessage) {
    const { client, tools } = await createMCPClient()

    console.log(`Tools disponibles: ${tools.map(t => t.name).join(", ")}\n`)

    // OpenAI usa formato "function" en vez de Anthropic's input_schema
    const openaiTools = tools.map(tool => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.input_schema  // mismo schema JSON, distinto key
        }
    }))

    const messages = [
        { role: "user", content: userMessage }
    ]

    try {
        let totalTokens = 0
        while (true) {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",  // o gpt-4-turbo, o-3, etc.
                tools: openaiTools,
                messages
            })
            if (response.usage) {
                totalTokens += response.usage.total_tokens
                console.log("Tokens en esta llamada:", response.usage)
            }

            const choice = response.choices[0]
            const message = choice.message

            console.log(`Finish reason: ${choice.finish_reason}`)

            // Agregar respuesta del asistente al historial
            messages.push(message)

            // Si terminó sin tools → respuesta final
            if (choice.finish_reason === "stop") {
                return {
                    answer: message.content,
                    tokens: totalTokens
                }
            }

            // Si quiere usar tools
            if (choice.finish_reason === "tool_calls") {
                for (const toolCall of message.tool_calls) {
                    const toolName = toolCall.function.name
                    const toolInput = JSON.parse(toolCall.function.arguments)

                    console.log(`\nEjecutando tool: ${toolName}`)
                    console.log(`Input: ${JSON.stringify(toolInput, null, 2)}`)

                    let resultContent

                    try {
                        const result = await callTool(client, toolName, toolInput)
                        resultContent = result.content
                            .map(c => (c.type === "text" ? c.text : JSON.stringify(c)))
                            .join("\n")
                    } catch (err) {
                        resultContent = `Error ejecutando tool: ${err.message}`
                    }

                    console.log(`Resultado: ${resultContent.slice(0, 200)}...`)

                    // En OpenAI cada tool result va como mensaje separado con role "tool"
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: resultContent
                    })
                }
            }
        }
    } finally {
        await closeMCPClient(client)
    }
}