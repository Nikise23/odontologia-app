const mongoose = require('mongoose');

// Esquema para Cita
const citaSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El ID del paciente es obligatorio']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha de la cita es obligatoria']
  },
  hora: {
    type: String,
    required: [true, 'La hora de la cita es obligatoria'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  motivo: {
    type: String,
    trim: true,
    maxlength: [500, 'El motivo no puede exceder 500 caracteres']
  },
  estado: {
    type: String,
    enum: ['programada', 'confirmada', 'en_progreso', 'completada', 'ausente', 'cancelada'],
    default: 'programada'
  },
  observaciones: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las observaciones no pueden exceder 1000 caracteres']
  },
  consultaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consulta',
    default: null
  },
  duracionEstimada: {
    type: Number,
    default: 30, // minutos
    min: [15, 'La duración mínima es 15 minutos'],
    max: [180, 'La duración máxima es 180 minutos']
  },
  tipoCita: {
    type: String,
    enum: ['consulta', 'tratamiento', 'revision', 'urgencia', 'limpieza'],
    default: 'consulta'
  },
  costoEstimado: {
    type: Number,
    default: 0,
    min: [0, 'El costo no puede ser negativo']
  },
  recordatorioEnviado: {
    type: Boolean,
    default: false
  },
  fechaRecordatorio: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
citaSchema.index({ fecha: 1, hora: 1 });
citaSchema.index({ pacienteId: 1, fecha: -1 });
citaSchema.index({ estado: 1, fecha: 1 });
citaSchema.index({ fecha: 1, estado: 1 });

// Middleware para validar que no haya citas duplicadas en la misma fecha y hora
citaSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('fecha') || this.isModified('hora')) {
    const fechaCita = new Date(this.fecha);
    fechaCita.setHours(parseInt(this.hora.split(':')[0]));
    fechaCita.setMinutes(parseInt(this.hora.split(':')[1]));
    
    const citaExistente = await this.constructor.findOne({
      _id: { $ne: this._id },
      fecha: {
        $gte: new Date(fechaCita.getTime() - 30 * 60000), // 30 minutos antes
        $lte: new Date(fechaCita.getTime() + 30 * 60000)  // 30 minutos después
      },
      estado: { $nin: ['cancelada', 'ausente'] }
    });

    if (citaExistente) {
      const error = new Error('Ya existe una cita programada en ese horario');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Método estático para obtener citas del día
citaSchema.statics.getCitasDelDia = function(fecha) {
  const inicioDia = new Date(fecha);
  inicioDia.setHours(0, 0, 0, 0);
  
  const finDia = new Date(fecha);
  finDia.setHours(23, 59, 59, 999);
  
  return this.find({
    fecha: {
      $gte: inicioDia,
      $lte: finDia
    }
  }).populate('pacienteId', 'nombre ci telefono email')
    .populate('consultaId')
    .sort({ hora: 1 });
};

// Método estático para obtener próximas citas
citaSchema.statics.getProximasCitas = function(limite = 10) {
  const ahora = new Date();
  
  return this.find({
    fecha: { $gte: ahora },
    estado: { $in: ['programada', 'confirmada'] }
  }).populate('pacienteId', 'nombre ci telefono')
    .sort({ fecha: 1, hora: 1 })
    .limit(limite);
};

// Método de instancia para marcar como atendida
citaSchema.methods.marcarComoAtendida = function(consultaId) {
  this.estado = 'completada';
  this.consultaId = consultaId;
  return this.save();
};

// Método de instancia para marcar como ausente
citaSchema.methods.marcarComoAusente = function() {
  this.estado = 'ausente';
  return this.save();
};

module.exports = mongoose.model('Cita', citaSchema);





