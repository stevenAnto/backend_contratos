import { connectDB } from "./db.js"
import Terapia from "./models/Terapia.js"

await connectDB()

const nuevaTerapia = new Terapia({
    nombre: "Luis",
    fecha: new Date("2026-03-16T09:00:00"),
    estado: "pendiente"
})

await nuevaTerapia.save()
console.log("Terapia creada:", nuevaTerapia)

process.exit(0)