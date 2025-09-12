require('dotenv').config();
const mongoose = require('mongoose');
const Persona = require('./models/Persona');

const personasData = [
  { nombres: "Esteven", apellidos: "", dni: "0001", celular: "" },
  { nombres: "Patricia", apellidos: "", dni: "0002", celular: "" },
  { nombres: "Nancy Pachapuma", apellidos: "", dni: "0003", celular: "" },
  { nombres: "Paola Yana", apellidos: "", dni: "0004", celular: "" },
  { nombres: "Clara Carbajal", apellidos: "", dni: "0005", celular: "" },
  { nombres: "David Calcina", apellidos: "", dni: "0006", celular: "" },
  { nombres: "Romulo Carbajal", apellidos: "", dni: "0007", celular: "" },
  { nombres: "Jhon Pachapuma", apellidos: "", dni: "0008", celular: "" },
  { nombres: "Sabino Puma", apellidos: "", dni: "0009", celular: "" },
  { nombres: "Elva Pachapuma", apellidos: "", dni: "0010", celular: "" },
  { nombres: "Maximo Condori", apellidos: "", dni: "0011", celular: "" },
  { nombres: "Nilton Suania", apellidos: "", dni: "0012", celular: "" },
  { nombres: "Ortiz Quispe", apellidos: "", dni: "0013", celular: "" },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB');
    const result = await Persona.insertMany(personasData);
    console.log(`Se insertaron ${result.length} personas`);
    mongoose.disconnect();
  })
  .catch(err => console.error('Error:', err));
