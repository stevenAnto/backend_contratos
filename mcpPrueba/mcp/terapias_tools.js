import Terapia from "../models/Terapia.js"

export const tools = [

    {
        name: "crear_terapia",
        description: "Crea una nueva terapia",
        parameters: {
            type: "object",
            properties: {
                nombre: { type: "string" },
                fecha: { type: "string" },
                precio: { type: "number" }
            },
            required: ["nombre", "fecha"]
        },
        execute: async ({ nombre, fecha, precio }) => {

            const terapia = new Terapia({
                nombre,
                fecha,
                precio
            })

            const saved = await terapia.save()

            return saved
        }
    },

    {
        name: "listar_terapias",
        description: "Obtiene todas las terapias",
        parameters: {
            type: "object",
            properties: {}
        },
        execute: async () => {

            const terapias = await Terapia.find()

            return terapias
        }
    },

    {
        name: "obtener_terapia",
        description: "Obtiene una terapia por ID",
        parameters: {
            type: "object",
            properties: {
                id: { type: "string" }
            },
            required: ["id"]
        },
        execute: async ({ id }) => {

            const terapia = await Terapia.findById(id)

            return terapia
        }
    },

    {
        name: "actualizar_terapia",
        description: "Actualiza una terapia",
        parameters: {
            type: "object",
            properties: {
                id: { type: "string" },
                estado: { type: "string" },
                precio: { type: "number" }
            },
            required: ["id"]
        },
        execute: async ({ id, ...data }) => {

            const terapia = await Terapia.findByIdAndUpdate(
                id,
                data,
                { new: true }
            )

            return terapia
        }
    },

    {
        name: "eliminar_terapia",
        description: "Elimina una terapia",
        parameters: {
            type: "object",
            properties: {
                id: { type: "string" }
            },
            required: ["id"]
        },
        execute: async ({ id }) => {

            await Terapia.findByIdAndDelete(id)

            return { message: "Terapia eliminada" }
        }
    }

]