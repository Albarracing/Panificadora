import mongoose from "mongoose";

const cuentaCorrienteSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  repartoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reparto",
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
  },
  totalPagado: {
    type: Number,
    default: 0,
  },
  totalDeuda: {
    type: Number,
    default: 0,
  },
  totalDevoluciones: {
    type: Number,
    default: 0,
  },
  montoTotalReparto: { type: Number, default: 0 },
  detalles: [
    {
      articuloId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Articulo",
        required: true,
      },
      cantidad: {
        type: Number,
        required: true,
      },
      cantidadDevuelta: {
        type: Number,
        required: true,
      },
      importe: {
        type: Number,
        required: true,
      },
      tipo: {
        type: String, // Puede ser 'pago', 'deuda', 'devolución', etc.
        required: true,
      },
      monto: {
        type: Number,
        required: true,
      },
      fecha: {
        type: Date,
        required: true,
      },
      unidad: {
        type: String,
        required: true,
      },
    },
  ],
});

const CuentaCorriente = mongoose.model(
  "CuentaCorriente",
  cuentaCorrienteSchema
);

export default CuentaCorriente;
