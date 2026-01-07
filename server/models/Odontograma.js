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

// Método para convertir Map a objeto plano al serializar
odontogramaSchema.methods.toJSON = function() {
  const obj = this.toObject({ virtuals: true });
  
  // Convertir el Map de piezasDentales a un objeto plano
  // Mongoose puede devolver el Map como un objeto especial, necesitamos convertirlo
  let piezasObj = {};
  
  if (this.piezasDentales && this.piezasDentales instanceof Map) {
    // Si es un Map, convertirlo directamente
    this.piezasDentales.forEach((value, key) => {
      piezasObj[key] = value;
    });
    console.log(`📤 toJSON: Convertido Map con ${this.piezasDentales.size} piezas a objeto`);
  } else if (obj.piezasDentales) {
    // Si ya es un objeto (después de toObject), verificar su estructura
    if (obj.piezasDentales instanceof Map) {
      // Aún es un Map después de toObject (poco común pero posible)
      obj.piezasDentales.forEach((value, key) => {
        piezasObj[key] = value;
      });
      console.log(`📤 toJSON: Map encontrado después de toObject, ${obj.piezasDentales.size} piezas`);
    } else if (typeof obj.piezasDentales === 'object' && obj.piezasDentales !== null) {
      // Es un objeto, copiarlo directamente
      piezasObj = { ...obj.piezasDentales };
      console.log(`📤 toJSON: Objeto encontrado, ${Object.keys(piezasObj).length} piezas`);
    }
  }
  
  obj.piezasDentales = piezasObj;
  console.log(`📤 toJSON: Enviando ${Object.keys(piezasObj).length} piezas al frontend`);
  
  return obj;
};

module.exports = mongoose.model('Odontograma', odontogramaSchema);
