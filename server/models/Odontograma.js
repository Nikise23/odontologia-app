const mongoose = require('mongoose');

// Esquema para Odontograma
const odontogramaSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El ID del paciente es obligatorio']
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  },
  // Estado de cada pieza dental
  piezasDentales: {
    type: Map,
    of: {
      ausente: { type: Boolean, default: false }, // Si el diente está ausente
      caras: {
        derecha: { type: String, default: null },    // Cara derecha
        izquierda: { type: String, default: null }, // Cara izquierda
        superior: { type: String, default: null },  // Cara superior
        inferior: { type: String, default: null },   // Cara inferior
        central: { type: String, default: null }     // Cara central (círculo del medio)
      },
      // Mantener compatibilidad con versiones anteriores
      requerido: { type: String, default: null },
      existente: { type: String, default: null }
    },
    default: {}
  },
  // Historial de cambios
  historial: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    pieza: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      enum: ['requerido', 'existente', 'cara', 'ausente'],
      required: true
    },
    cara: {
      type: String,
      enum: ['derecha', 'izquierda', 'superior', 'inferior', 'central'],
      required: false
    },
    estadoAnterior: String,
    estadoNuevo: String,
    observaciones: String
  }]
}, {
  timestamps: true
});

// Índices
odontogramaSchema.index({ pacienteId: 1, fecha: -1 });
odontogramaSchema.index({ 'historial.fecha': -1 });

module.exports = mongoose.model('Odontograma', odontogramaSchema);
