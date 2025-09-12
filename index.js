require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const Persona = require('./models/Persona');
const Contrato = require('./models/Contrato');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- DEBUG: Middleware para loguear cada request ---
// --- DEBUG: Middleware para loguear cada request ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Solo revisar body si existe
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  
  next();
});


// --- Conexión a MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err));

// --- Rutas ---

// Ruta de prueba
app.get('/', (req, res) => {
  console.log('Ruta / accedida');
  res.send('Backend funcionando correctamente');
});

// Crear persona
app.post('/personas', async (req, res) => {
  try {
    const persona = new Persona(req.body);
    const result = await persona.save();
    console.log('Persona creada:', result);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creando persona:', err);
    res.status(400).json({ error: err.message });
  }
});

// Obtener personas
app.get('/personas', async (req, res) => {
  try {
    const personas = await Persona.find();
    console.log(`Se obtuvieron ${personas.length} personas`);
    res.json(personas);
  } catch (err) {
    console.error('Error obteniendo personas:', err);
    res.status(500).json({ error: err.message });
  }
});


const buscarPersonaPorNombre = async (nombre) => {
  try {
    const personas = await Persona.find({
      $or: [
        { nombres: { $regex: nombre, $options: 'i' } },
        { apellidos: { $regex: nombre, $options: 'i' } }
      ]
    });
    
    return personas.length > 0 ? personas[0] : null;
  } catch (error) {
    console.error('Error buscando persona:', error);
    throw error;
  }
};

// Crear contrato
// Crear contrato
app.post('/contratos', async (req, res) => {
  try {
    const {
      nombrePrestamista,
      nombrePrestatario,
      monto,
      plazo,
      tasaInteres,
      fecha,
      estado,
      observaciones
    } = req.body;

    // Buscar el prestamista por nombre
    const prestamista = await buscarPersonaPorNombre(nombrePrestamista);
    if (!prestamista) {
      return res.status(404).json({ 
        error: `Prestamista "${nombrePrestamista}" no encontrado` 
      });
    }

    // Buscar el prestatario por nombre
    const prestatario = await buscarPersonaPorNombre(nombrePrestatario);
    if (!prestatario) {
      return res.status(404).json({ 
        error: `Prestatario "${nombrePrestatario}" no encontrado` 
      });
    }

    // Crear el objeto contrato con los IDs correctos
    const contratoData = {
      idPrestamista: prestamista._id,
      idPrestatario: prestatario._id,
      monto,
      plazo,
      tasaInteres,
      fecha,
      estado,
      observaciones
    };

    // Guardar el contrato
    const contrato = new Contrato(contratoData);
    const result = await contrato.save();
    
    console.log('Contrato creado:', result);
    res.status(201).json(result);

  } catch (err) {
    console.error('Error creando contrato:', err);
    res.status(400).json({ error: err.message });
  }
});

// Obtener contratos
app.get('/contratos', async (req, res) => {
  try {
    const contratos = await Contrato.find()
      .populate('idPrestamista', 'nombres apellidos dni celular')
      .populate('idPrestatario', 'nombres apellidos dni celular');
    console.log(`Se obtuvieron ${contratos.length} contratos`);
    res.json(contratos);
  } catch (err) {
    console.error('Error obteniendo contratos:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Escuchar puerto ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});