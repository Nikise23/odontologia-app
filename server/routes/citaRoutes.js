const express = require('express');
const router = express.Router();
const Cita = require('../models/Cita');
const Paciente = require('../models/Paciente');
const Joi = require('joi');

// Esquema de validación para cita
const citaSchema = Joi.object({
  pacienteId: Joi.string().required(),
  fecha: Joi.date().required(),
  hora: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  motivo: Joi.string().max(500).trim().allow(''),
  observaciones: Joi.string().max(1000).trim().allow(''),
  duracionEstimada: Joi.number().min(15).max(180).default(30),
  tipoCita: Joi.string().valid('consulta', 'tratamiento', 'revision', 'urgencia', 'limpieza').default('consulta'),
  costoEstimado: Joi.number().min(0).default(0)
});

// GET /api/citas - Obtener todas las citas con filtros
router.get('/', async (req, res) => {
  try {
    const { fecha, estado, pacienteId, limite = 50 } = req.query;
    
    let filtros = {};
    
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      filtros.fecha = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }
    
    if (estado) {
      filtros.estado = estado;
    }
    
    if (pacienteId) {
      filtros.pacienteId = pacienteId;
    }
    
    const citas = await Cita.find(filtros)
      .populate('pacienteId', 'nombre ci telefono email')
      .populate('consultaId')
      .sort({ fecha: 1, hora: 1 })
      .limit(parseInt(limite));

    res.json({
      success: true,
      data: citas
    });
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo citas'
    });
  }
});

// GET /api/citas/dia/:fecha - Obtener citas de un día específico
router.get('/dia/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const fechaDate = new Date(fecha);
    
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida'
      });
    }
    
    const citas = await Cita.getCitasDelDia(fechaDate);
    
    res.json({
      success: true,
      data: citas
    });
  } catch (error) {
    console.error('Error obteniendo citas del día:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo citas del día'
    });
  }
});

// GET /api/citas/proximas - Obtener próximas citas
router.get('/proximas', async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    const citas = await Cita.getProximasCitas(parseInt(limite));
    
    res.json({
      success: true,
      data: citas
    });
  } catch (error) {
    console.error('Error obteniendo próximas citas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo próximas citas'
    });
  }
});

// GET /api/citas/:id - Obtener una cita específica
router.get('/:id', async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id)
      .populate('pacienteId')
      .populate('consultaId');
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: cita
    });
  } catch (error) {
    console.error('Error obteniendo cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cita'
    });
  }
});

// POST /api/citas - Crear nueva cita
router.post('/', async (req, res) => {
  try {
    console.log('📅 Datos recibidos para crear cita:', req.body);
    
    const { error, value } = citaSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Error de validación:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Datos de cita inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    console.log('✅ Datos validados:', value);
    
    // Verificar que el paciente existe
    const paciente = await Paciente.findById(value.pacienteId);
    if (!paciente) {
      console.log('❌ Paciente no encontrado:', value.pacienteId);
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }
    
    console.log('✅ Paciente encontrado:', paciente.nombre);
    
    // Combinar fecha y hora
    const fechaCompleta = new Date(value.fecha);
    const [hora, minutos] = value.hora.split(':');
    fechaCompleta.setHours(parseInt(hora), parseInt(minutos), 0, 0);
    
    console.log('📅 Fecha combinada:', fechaCompleta);
    
    const cita = new Cita({
      ...value,
      fecha: fechaCompleta
    });
    
    console.log('💾 Guardando cita:', cita);
    
    await cita.save();
    
    console.log('✅ Cita guardada exitosamente');
    
    // Poblar datos del paciente para la respuesta
    await cita.populate('pacienteId', 'nombre ci telefono email');
    
    res.json({
      success: true,
      message: 'Cita creada exitosamente',
      data: cita
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cita programada en ese horario'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creando cita'
    });
  }
});

// PUT /api/citas/:id - Actualizar cita
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = citaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de cita inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Combinar fecha y hora si se proporcionan
    if (value.fecha && value.hora) {
      const fechaCompleta = new Date(value.fecha);
      const [hora, minutos] = value.hora.split(':');
      fechaCompleta.setHours(parseInt(hora), parseInt(minutos), 0, 0);
      value.fecha = fechaCompleta;
    }
    
    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('pacienteId', 'nombre ci telefono email');
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: cita
    });
  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando cita'
    });
  }
});

// DELETE /api/citas/:id - Eliminar cita
router.delete('/:id', async (req, res) => {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id);
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando cita'
    });
  }
});

// PUT /api/citas/:id/atender - Marcar cita como atendida
router.put('/:id/atender', async (req, res) => {
  try {
    const { consultaId } = req.body;
    
    const cita = await Cita.findById(req.params.id);
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    await cita.marcarComoAtendida(consultaId);
    await cita.populate('pacienteId', 'nombre ci telefono email');
    
    res.json({
      success: true,
      message: 'Cita marcada como atendida',
      data: cita
    });
  } catch (error) {
    console.error('Error marcando cita como atendida:', error);
    res.status(500).json({
      success: false,
      message: 'Error marcando cita como atendida'
    });
  }
});

// PUT /api/citas/:id/ausente - Marcar cita como ausente
router.put('/:id/ausente', async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    await cita.marcarComoAusente();
    await cita.populate('pacienteId', 'nombre ci telefono email');
    
    res.json({
      success: true,
      message: 'Cita marcada como ausente',
      data: cita
    });
  } catch (error) {
    console.error('Error marcando cita como ausente:', error);
    res.status(500).json({
      success: false,
      message: 'Error marcando cita como ausente'
    });
  }
});

// GET /api/citas/estadisticas - Obtener estadísticas de citas
router.get('/estadisticas/resumen', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let filtros = {};
    if (fechaInicio && fechaFin) {
      filtros.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }
    
    const estadisticas = await Cita.aggregate([
      { $match: filtros },
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 },
          totalCosto: { $sum: '$costoEstimado' }
        }
      }
    ]);
    
    const totalCitas = await Cita.countDocuments(filtros);
    
    res.json({
      success: true,
      data: {
        totalCitas,
        porEstado: estadisticas,
        resumen: estadisticas.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
});

module.exports = router;
