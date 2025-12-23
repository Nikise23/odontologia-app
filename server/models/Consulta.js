const mongoose = require('mongoose');

// Esquema para Consulta
const consultaSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El ID del paciente es obligatorio']
  },
  numeroConsulta: {
    type: Number,
    required: [true, 'El número de consulta es obligatorio']
  },
  fecha: {
    type: Date,
    default: Date.now,
    required: [true, 'La fecha de consulta es obligatoria']
  },
  motivoConsulta: {
    type: String,
    trim: true,
    maxlength: [500, 'El motivo no puede exceder 500 caracteres']
  },
  diagnostico: {
    type: String,
    trim: true,
    maxlength: [1000, 'El diagnóstico no puede exceder 1000 caracteres']
  },
  tratamientosRealizados: [{
    piezaDental: {
      type: String,
      required: true
    },
    tratamiento: {
      type: String,
      required: true
    },
    costo: {
      type: Number,
      required: true,
      min: [0, 'El costo no puede ser negativo']
    },
    observaciones: {
      type: String,
      trim: true
    }
  }],
  costoTotal: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'El costo total no puede ser negativo']
  },
  costoConsulta: {
    type: Number,
    required: [true, 'El costo de la consulta es obligatorio'],
    min: [0, 'El costo de la consulta no puede ser negativo'],
    default: 0
  },
  estado: {
    type: String,
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  observacionesGenerales: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden exceder 1000 caracteres']
  },
  cambiosOdontograma: {
    type: String,
    trim: true,
    maxlength: [1000, 'Los cambios en el odontograma no pueden exceder 1000 caracteres']
  },
  // Almacenar cambios específicos del odontograma
  odontogramaSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Anamnesis - Campos médicos adicionales
  anamnesis: {
    sintomas: String,
    alergias: String,
    medicamentos: String,
    antecedentesClinicos: String,
    examenFisico: String,
    planTratamiento: String
  }
}, {
  timestamps: true
});

// Índices
consultaSchema.index({ pacienteId: 1, numeroConsulta: 1 });
consultaSchema.index({ pacienteId: 1, fecha: -1 });
consultaSchema.index({ numeroConsulta: 1 });

// Middleware para calcular el costo total automáticamente
consultaSchema.pre('save', function(next) {
  if (this.tratamientosRealizados && this.tratamientosRealizados.length > 0) {
    this.costoTotal = this.tratamientosRealizados.reduce((total, tratamiento) => {
      return total + (tratamiento.costo || 0);
    }, 0);
  } else {
    // Si no hay tratamientos, establecer costo total en 0
    this.costoTotal = 0;
  }
  next();
});

module.exports = mongoose.model('Consulta', consultaSchema);
