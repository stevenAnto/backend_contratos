const mongoose = require('mongoose');

const contratoSchema = new mongoose.Schema({
  idPrestamista: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true },
  idPrestatario: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true },
  monto: { type: Number, required: true },
  plazo: { type: Number, required: true },
  tasaInteres: { type: Number, required: true },
  fecha: { type: String, required: true },
  estado: { type: String, required: true },
  observaciones: { type: String }
});

module.exports = mongoose.model('Contrato', contratoSchema);

