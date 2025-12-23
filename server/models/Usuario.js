const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir por defecto en consultas
  },
  rol: {
    type: String,
    enum: ['admin', 'dentista', 'secretaria', 'paciente'],
    default: 'secretaria',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: function() {
      return this.rol === 'paciente';
    }
  },
  ultimoAcceso: {
    type: Date
  },
  intentosFallidos: {
    type: Number,
    default: 0
  },
  bloqueado: {
    type: Boolean,
    default: false
  },
  bloqueadoHasta: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
usuarioSchema.pre('save', async function(next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
usuarioSchema.methods.compararPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para resetear intentos fallidos
usuarioSchema.methods.resetearIntentos = async function() {
  this.intentosFallidos = 0;
  this.bloqueado = false;
  this.bloqueadoHasta = undefined;
  await this.save();
};

// Índices
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ rol: 1 });
usuarioSchema.index({ activo: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);




