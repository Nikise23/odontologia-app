const mongoose = require('mongoose');

const historialPagoSchema = new mongoose.Schema({
  pagoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago',
    required: true
  },
  accion: {
    type: String,
    enum: ['creado', 'modificado', 'eliminado'],
    required: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  rol: {
    type: String,
    enum: ['dentista', 'secretaria', 'paciente'],
    required: false
  },
  datosAnteriores: {
    type: Object,
    default: {}
  },
  datosNuevos: {
    type: Object,
    default: {}
  },
  razon: {
    type: String,
    trim: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HistorialPago', historialPagoSchema);





