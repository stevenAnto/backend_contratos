const mongoose = require('mongoose');

const cuotaSchema = new mongoose.Schema({
  contratoId: { type: Number, required: true }, // referencia al id del contrato (no al ObjectId)
  numeroCuota: { type: Number, required: true },
  monto: { type: Number, required: true },
  fechaVencimiento: { type: Date, required: true },
  fechaPago: { type: Date, default: null },
  estado: { 
    type: String, 
    enum: ['pendiente', 'pagado', 'atrasado'], 
    default: 'pendiente' 
  }
});

module.exports = mongoose.model('Cuota', cuotaSchema);