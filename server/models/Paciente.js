const mongoose = require('mongoose');

// Esquema para Paciente
const pacienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  ci: {
    type: String,
    required: [true, 'La cédula de identidad es obligatoria'],
    unique: true,
    trim: true,
    maxlength: [20, 'La CI no puede exceder 20 caracteres']
  },
  alergias: {
    type: String,
    default: 'Ninguna',
    trim: true,
    maxlength: [200, 'Las alergias no pueden exceder 200 caracteres']
  },
  edad: {
    type: Number,
    min: [0, 'La edad no puede ser negativa'],
    max: [120, 'La edad no puede exceder 120 años']
  },
  fechaNacimiento: {
    type: Date
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: [20, 'El teléfono no puede exceder 20 caracteres']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  obraSocial: {
    type: String,
    trim: true,
    maxlength: [100, 'La obra social no puede exceder 100 caracteres']
  },
  numeroAfiliado: {
    type: String,
    trim: true,
    maxlength: [50, 'El número de afiliado no puede exceder 50 caracteres']
  },
  // Anamnesis - Campos de estado médico
  anamnesis: {
    diabetes: {
      type: Boolean,
      default: false
    },
    hipertension: {
      type: Boolean,
      default: false
    },
    cardiopatia: {
      type: Boolean,
      default: false
    },
    embarazo: {
      type: Boolean,
      default: false
    },
    medicamentos: {
      type: String,
      default: 'Ninguno',
      trim: true
    },
    antecedentesFamiliares: {
      type: String,
      default: 'Ninguno',
      trim: true
    },
    observacionesMedicas: {
      type: String,
      default: '',
      trim: true
    }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsqueda eficiente
pacienteSchema.index({ nombre: 'text', ci: 'text' });
pacienteSchema.index({ ci: 1 });
pacienteSchema.index({ fechaRegistro: -1 });

module.exports = mongoose.model('Paciente', pacienteSchema);

