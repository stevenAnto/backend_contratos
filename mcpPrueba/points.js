import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./db.js"
import Terapia from "./models/Terapia.js"
import { runAgent } from "./agent.js"

dotenv.config()

const app = express()
app.use(express.json())

/* ======================
   CONEXIÓN A MONGODB
====================== */

connectDB()


/* ======================
   ENDPOINT DEL AGENTE
====================== */

app.post("/agent", async (req, res) => {

    const { message } = req.body

    if (!message) {
        return res.status(400).json({ error: "El campo 'message' es requerido" })
    }

    try {

        const result = await runAgent(message)

        res.json({
            response: result.answer,
            tokens: result.tokens
        })

    } catch (err) {

        console.error("Error en el agente:", err)

        res.status(500).json({ error: err.message })
    }

})


/* ======================
   CRUD TERAPIAS
====================== */


// Crear terapia
app.post("/terapis", async (req, res) => {

    try {

        const terapia = new Terapia(req.body)

        const saved = await terapia.save()

        res.json(saved)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})


// Obtener todas
app.get("/terapis", async (req, res) => {

    try {

        const terapias = await Terapia.find()

        res.json(terapias)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})


// Obtener una
app.get("/terapis/:id", async (req, res) => {

    try {

        const terapia = await Terapia.findById(req.params.id)

        res.json(terapia)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})


// Actualizar
app.put("/terapis/:id", async (req, res) => {

    try {

        const terapia = await Terapia.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )

        res.json(terapia)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})


// Eliminar
app.delete("/terapis/:id", async (req, res) => {

    try {

        await Terapia.findByIdAndDelete(req.params.id)

        res.json({ message: "Terapia eliminada" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})


/* ======================
   SERVIDOR
====================== */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})