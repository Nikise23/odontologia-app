const mongoose = require('mongoose');

// Esquema para Pago
const pagoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El ID del paciente es obligatorio']
  },
  consultaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consulta',
    required: false // Puede ser null si es un pago independiente
  },
  tratamientoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tratamiento',
    required: false // Puede ser null si es un pago independiente
  },
  fecha: {
    type: Date,
    default: Date.now,
    required: [true, 'La fecha del pago es obligatoria']
  },
  tipoPago: {
    type: String,
    enum: ['consulta', 'tratamiento', 'parcial', 'total'],
    required: [true, 'El tipo de pago es obligatorio']
  },
  concepto: {
    type: String,
    required: [true, 'El concepto del pago es obligatorio'],
    maxlength: [200, 'El concepto no puede exceder 200 caracteres']
  },
  monto: {
    type: Number,
    required: [true, 'El monto es obligatorio'],
    min: [0, 'El monto no puede ser negativo']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'cancelado'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'cheque'],
    default: 'efectivo'
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  },
  // Para pagos de tratamientos específicos
  tratamientosDetalle: [{
    piezaDental: String,
    tratamiento: String,
    costo: Number,
    pagado: {
      type: Number,
      default: 0
    }
  }],
  // Campos adicionales para calcular balance pendiente
  montoTotal: {
    type: Number,
    required: false
  },
  montoPagado: {
    type: Number,
    default: 0,
    required: false
  },
  saldoPendiente: {
    type: Number,
    default: 0,
    required: false
  },
  // Campos de auditoría
  usuarioCreador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false
  },
  rolCreador: {
    type: String,
    required: false
  },
  ultimaModificacion: {
    type: Date
  },
  usuarioModificador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false
  }
}, {
  timestamps: true
});

// Índices
pagoSchema.index({ pacienteId: 1, fecha: -1 });
pagoSchema.index({ consultaId: 1 });
pagoSchema.index({ estado: 1 });

module.exports = mongoose.model('Pago', pagoSchema);