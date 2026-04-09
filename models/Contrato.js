const mongoose = require('mongoose');
const Pago = require('./Cuota');

const contratoSchema = new mongoose.Schema({
  id:{type: Number, required: true},
  prestamistas: [
    {
      persona: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true },
      monto: { type: Number, required: true } // monto prestado por esa persona
    }
  ],
  prestatarios: [
    {
      persona: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true },
      monto: { type: Number } // opcional: cuánto recibe cada uno (puede usarse si se reparte)
    }
  ],
  montoTotal: { type: Number ,default:0 }, // suma de todos los montos
  plazo: { type: Number, required: true },
  tasaInteres: { type: Number, required: true },
  fecha: { type: String, required: true },
  estado: { type: String, required: true },
  observaciones: { type: String }
});

// Middleware: calcular montoTotal antes de guardar
contratoSchema.pre('save', function (next) {
  console.log("entro a presabe")
  const montoTotal = this.prestamistas.reduce((acc, p) => acc + p.monto, 0);
  this.montoTotal = montoTotal;
  next();
});
contratoSchema.pre('insertMany', function(next, docs) {
  docs.forEach(doc => {
    const montoTotal = doc.prestamistas.reduce((acc, p) => acc + p.monto, 0);
    doc.montoTotal = montoTotal;
  });
  next();
});
// Después de guardar un contrato, generar sus cuotas
contratoSchema.post('save', async function(doc, next) {
  try {
    await generarPagosDesdeContrato(doc);
    next();
  } catch (err) {
    console.error("Error generando cuotas:", err);
    next(err);
  }
});
async function generarPagosDesdeContrato(contrato) {
  const pagos = [];
  const montoCuota = calcularMontoCuota(contrato.montoTotal, contrato.tasaInteres);
  const fechas = generarFechasVencimiento(contrato.fecha, contrato.plazo);

  fechas.forEach((fecha, index) => {
    pagos.push(new Pago({
      contratoId: contrato.id,
      numeroCuota: index + 1,
      monto: montoCuota,
      fechaVencimiento: fecha,
      fechaPago: null,
      estado: "pendiente"
    }));
  });

  await Pago.insertMany(pagos);

  return pagos;
}

function calcularMontoCuota(montoTotal, tasa) {
  return montoTotal*tasa ;
}
function generarFechasVencimiento(fechaContrato, plazo) {
  const fechas = [];
  const inicio = new Date(fechaContrato);

  for (let i = 1; i <= plazo; i++) {
    const venc = new Date(inicio);
    venc.setMonth(inicio.getMonth() + i);

    // Ajuste: si el mes no tiene el mismo día, usamos el último día disponible
    if (venc.getDate() !== inicio.getDate()) {
      venc.setDate(0); // último día del mes anterior
    }

    fechas.push(venc);
  }

  return fechas;
}

module.exports = mongoose.model('Contrato', contratoSchema);

