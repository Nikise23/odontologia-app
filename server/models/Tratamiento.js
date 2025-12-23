const mongoose = require('mongoose');

// Esquema para Tratamiento
const tratamientoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El ID del paciente es obligatorio']
  },
  consultaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consulta',
    required: false // Puede ser null si es un tratamiento independiente
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del tratamiento es obligatorio'],
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  piezaDental: {
    type: String,
    required: [true, 'La pieza dental es obligatoria']
  },
  tipoTratamiento: {
    type: String,
    enum: ['preventivo', 'restaurativo', 'endodoncia', 'periodoncia', 'ortodoncia', 'cirugia', 'protesis', 'otros'],
    default: 'restaurativo'
  },
  estado: {
    type: String,
    enum: ['programado', 'en_proceso', 'completado', 'cancelado'],
    default: 'programado'
  },
  costo: {
    type: Number,
    required: [true, 'El costo es obligatorio'],
    min: [0, 'El costo no puede ser negativo']
  },
  fechaProgramada: {
    type: Date,
    required: false
  },
  fechaInicio: {
    type: Date,
    required: false
  },
  fechaCompletado: {
    type: Date,
    required: false
  },
  observaciones: {
    type: String,
    maxlength: [1000, 'Las observaciones no pueden exceder 1000 caracteres']
  },
  // Para tratamientos que requieren múltiples sesiones
  sesiones: [{
    numero: {
      type: Number,
      required: true
    },
    fecha: {
      type: Date,
      required: true
    },
    descripcion: {
      type: String,
      maxlength: [300, 'La descripción de la sesión no puede exceder 300 caracteres']
    },
    costo: {
      type: Number,
      min: [0, 'El costo no puede ser negativo']
    },
    completada: {
      type: Boolean,
      default: false
    }
  }],
  // Para tratamientos que requieren materiales
  materiales: [{
    nombre: {
      type: String,
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    costoUnitario: {
      type: Number,
      required: true,
      min: [0, 'El costo unitario no puede ser negativo']
    },
    costoTotal: {
      type: Number,
      required: true,
      min: [0, 'El costo total no puede ser negativo']
    }
  }]
}, {
  timestamps: true
});

// Índices
tratamientoSchema.index({ pacienteId: 1, fechaProgramada: -1 });
tratamientoSchema.index({ consultaId: 1 });
tratamientoSchema.index({ estado: 1 });
tratamientoSchema.index({ piezaDental: 1 });

// Middleware para calcular costo total de materiales
tratamientoSchema.pre('save', function(next) {
  if (this.materiales && this.materiales.length > 0) {
    this.materiales.forEach(material => {
      material.costoTotal = material.cantidad * material.costoUnitario;
    });
  }
  next();
});

module.exports = mongoose.model('Tratamiento', tratamientoSchema);