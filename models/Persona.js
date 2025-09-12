const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema({
  nombres: { type: String, required: false },
  apellidos: { type: String, required: false },
  dni: { type: String, required: false},
  celular: { type: String, required: false }
});

module.exports = mongoose.model('Persona', personaSchema);

