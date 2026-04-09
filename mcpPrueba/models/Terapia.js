import mongoose from "mongoose"

const terapiaSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true
    },

    fecha: {
        type: Date,
        required: true
    },

    estado: {
        type: String,
        enum: ["asistio", "no asistio", "pendiente"],
        default: "pendiente"
    },

    precio: {
        type: Number
    }

})

export default mongoose.model("Terapia", terapiaSchema)