const express = require('express');
const router = express.Router();
const Consulta = require('../models/Consulta');
const Pago = require('../models/Pago');
const Joi = require('joi');

// Esquema de validación para consulta
const consultaSchema = Joi.object({
  pacienteId: Joi.string().required(),
  motivoConsulta: Joi.string().max(500).trim().allow(''),
  diagnostico: Joi.string().max(1000).trim().allow(''),
  tratamientosRealizados: Joi.array().items(
    Joi.object({
      piezaDental: Joi.string().required(),
      tratamiento: Joi.string().required(),
      costo: Joi.number().min(0).required(),
      observaciones: Joi.string().trim().allow('')
    })
  ),
  observacionesGenerales: Joi.string().max(1000).trim().allow(''),
  cambiosOdontograma: Joi.string().max(1000).trim().allow(''),
  costoConsulta: Joi.number().min(0).required(),
  odontogramaSnapshot: Joi.object().optional(),
  anamnesis: Joi.object({
    sintomas: Joi.string().allow(''),
    alergias: Joi.string().allow(''),
    medicamentos: Joi.string().allow(''),
    antecedentesClinicos: Joi.string().allow(''),
    examenFisico: Joi.string().allow(''),
    planTratamiento: Joi.string().allow('')
  }).optional()
});

// GET /api/consultas/:pacienteId - Obtener todas las consultas de un paciente
router.get('/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const consultas = await Consulta.find({ pacienteId })
      .sort({ numeroConsulta: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: consultas
    });
  } catch (error) {
    console.error('Error obteniendo consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo consultas'
    });
  }
});

// GET /api/consultas/:pacienteId/ultima - Obtener el número de la última consulta
router.get('/:pacienteId/ultima', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const ultimaConsulta = await Consulta.findOne({ pacienteId })
      .sort({ numeroConsulta: -1 })
      .select('numeroConsulta');

    const proximoNumero = ultimaConsulta ? ultimaConsulta.numeroConsulta + 1 : 1;

    res.json({
      success: true,
      data: { proximoNumero }
    });
  } catch (error) {
    console.error('Error obteniendo última consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo última consulta'
    });
  }
});

// POST /api/consultas - Crear nueva consulta
router.post('/', async (req, res) => {
  try {
    console.log('📋 Datos recibidos para crear consulta:', req.body);
    
    const { error, value } = consultaSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Error de validación:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Datos de consulta inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    console.log('✅ Datos validados:', value);

    // Verificar si debe cobrar consulta (condicional billing)
    const Tratamiento = require('../models/Tratamiento');
    const tratamientosPendientes = await Tratamiento.find({ 
      pacienteId: value.pacienteId,
      estado: { $in: ['programado', 'en_proceso', 'completado'] }
    });
    
    // Verificar si hay deuda en tratamientos
    let tieneDeudaTratamientos = false;
    for (const tratamiento of tratamientosPendientes) {
      const pagos = await Pago.find({ 
        tratamientoId: tratamiento._id,
        estado: { $ne: 'cancelado' }
      });
      
      const totalPagado = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);
      
      if (tratamiento.costo - totalPagado > 0) {
        tieneDeudaTratamientos = true;
        break;
      }
    }

    // Obtener el próximo número de consulta
    const ultimaConsulta = await Consulta.findOne({ pacienteId: value.pacienteId })
      .sort({ numeroConsulta: -1 })
      .select('numeroConsulta');

    const numeroConsulta = ultimaConsulta ? ultimaConsulta.numeroConsulta + 1 : 1;

    const consultaData = {
      ...value,
      numeroConsulta,
      fecha: new Date()
    };
    
    console.log('📋 Datos para crear consulta:', consultaData);
    
    const consulta = new Consulta(consultaData);
    
    console.log('📋 Consulta antes de guardar:', consulta);
    
    await consulta.save();
    
    console.log('✅ Consulta guardada exitosamente:', consulta);

    // Crear pago solo si NO tiene deuda en tratamientos
    if (!tieneDeudaTratamientos && value.costoConsulta > 0) {
      const pagoConsulta = new Pago({
        pacienteId: value.pacienteId,
        consultaId: consulta._id,
        fecha: new Date(),
        tipoPago: 'consulta',
        concepto: `Consulta #${numeroConsulta} - ${value.motivoConsulta || 'Consulta'}`,
        monto: value.costoConsulta,
        estado: 'pendiente',
        metodoPago: 'efectivo'
      });
      
      await pagoConsulta.save();
      console.log('✅ Pago de consulta creado automáticamente');
    }

    res.json({
      success: true,
      message: 'Consulta creada exitosamente',
      data: consulta,
      info: {
        cobroConsultaAplicado: !tieneDeudaTratamientos && value.costoConsulta > 0
      }
    });
  } catch (error) {
    console.error('Error creando consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando consulta'
    });
  }
});

// PUT /api/consultas/:id - Actualizar consulta
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = consultaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de consulta inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const consulta = await Consulta.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Consulta actualizada exitosamente',
      data: consulta
    });
  } catch (error) {
    console.error('Error actualizando consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando consulta'
    });
  }
});

// DELETE /api/consultas/:id - Eliminar consulta
router.delete('/:id', async (req, res) => {
  try {
    const consulta = await Consulta.findByIdAndDelete(req.params.id);

    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Consulta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando consulta'
    });
  }
});

// GET /api/consultas/:pacienteId/resumen - Obtener resumen de consultas y pagos
router.get('/:pacienteId/resumen', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const consultas = await Consulta.find({ pacienteId })
      .sort({ numeroConsulta: -1 })
      .select('-__v');

    const resumen = {
      totalConsultas: consultas.length,
      consultasCompletadas: consultas.filter(c => c.estado === 'completada').length,
      consultasPendientes: consultas.filter(c => c.estado === 'pendiente').length,
      costoTotal: consultas.reduce((total, consulta) => total + consulta.costoTotal, 0),
      ultimaConsulta: consultas[0] || null,
      historial: consultas.map(consulta => ({
        _id: consulta._id,
        numeroConsulta: consulta.numeroConsulta,
        fecha: consulta.fecha,
        motivoConsulta: consulta.motivoConsulta,
        tratamientosRealizados: consulta.tratamientosRealizados,
        costoTotal: consulta.costoTotal,
        estado: consulta.estado
      }))
    };

    res.json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen'
    });
  }
});

// POST /api/consultas/:id/guardar-odontograma - Guardar odontograma en consulta
router.post('/:id/guardar-odontograma', async (req, res) => {
  try {
    const { id } = req.params;
    const { odontogramaSnapshot, cambiosOdontograma } = req.body;
    
    const consulta = await Consulta.findByIdAndUpdate(
      id,
      {
        odontogramaSnapshot,
        cambiosOdontograma
      },
      { new: true }
    );
    
    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Odontograma guardado exitosamente',
      data: consulta
    });
  } catch (error) {
    console.error('Error guardando odontograma:', error);
    res.status(500).json({
      success: false,
      message: 'Error guardando odontograma'
    });
  }
});

// GET /api/consultas/:id/odontograma - Obtener odontograma de consulta
router.get('/:id/odontograma', async (req, res) => {
  try {
    const { id } = req.params;
    
    const consulta = await Consulta.findById(id)
      .select('odontogramaSnapshot cambiosOdontograma fecha');
    
    if (!consulta) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: {
        odontogramaSnapshot: consulta.odontogramaSnapshot,
        cambiosOdontograma: consulta.cambiosOdontograma,
        fecha: consulta.fecha
      }
    });
  } catch (error) {
    console.error('Error obteniendo odontograma:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo odontograma'
    });
  }
});

module.exports = router;
