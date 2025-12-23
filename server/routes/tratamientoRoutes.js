const express = require('express');
const router = express.Router();
const Tratamiento = require('../models/Tratamiento');
const Joi = require('joi');

// Esquema de validación para tratamiento
const tratamientoSchema = Joi.object({
  pacienteId: Joi.string().required(),
  consultaId: Joi.string().allow(''),
  nombre: Joi.string().max(200).required(),
  descripcion: Joi.string().max(500).trim().allow(''),
  piezaDental: Joi.string().required(),
  tipoTratamiento: Joi.string().valid('preventivo', 'restaurativo', 'endodoncia', 'periodoncia', 'ortodoncia', 'cirugia', 'protesis', 'otros').default('restaurativo'),
  estado: Joi.string().valid('programado', 'en_proceso', 'completado', 'cancelado').default('programado'),
  costo: Joi.number().min(0).required(),
  fechaProgramada: Joi.date().allow(''),
  fechaInicio: Joi.date().allow(''),
  fechaCompletado: Joi.date().allow(''),
  observaciones: Joi.string().max(1000).trim().allow(''),
  sesiones: Joi.array().items(
    Joi.object({
      numero: Joi.number().required(),
      fecha: Joi.date().required(),
      descripcion: Joi.string().max(300).trim().allow(''),
      costo: Joi.number().min(0),
      completada: Joi.boolean().default(false)
    })
  ),
  materiales: Joi.array().items(
    Joi.object({
      nombre: Joi.string().required(),
      cantidad: Joi.number().min(1).required(),
      costoUnitario: Joi.number().min(0).required(),
      costoTotal: Joi.number().min(0).required()
    })
  )
});

// GET /api/tratamientos/:pacienteId - Obtener todos los tratamientos de un paciente
router.get('/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const tratamientos = await Tratamiento.find({ pacienteId })
      .populate('consultaId', 'numeroConsulta motivoConsulta fecha')
      .sort({ fechaProgramada: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: tratamientos
    });
  } catch (error) {
    console.error('Error obteniendo tratamientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tratamientos'
    });
  }
});

// GET /api/tratamientos/historial/:pacienteId - Obtener historial completo de tratamientos
router.get('/historial/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const tratamientos = await Tratamiento.find({ pacienteId })
      .populate('consultaId', 'numeroConsulta motivoConsulta fecha')
      .sort({ fechaProgramada: -1 })
      .select('-__v');

    // Calcular estadísticas
    const estadisticas = {
      totalTratamientos: tratamientos.length,
      programados: tratamientos.filter(t => t.estado === 'programado').length,
      enProceso: tratamientos.filter(t => t.estado === 'en_proceso').length,
      completados: tratamientos.filter(t => t.estado === 'completado').length,
      cancelados: tratamientos.filter(t => t.estado === 'cancelado').length,
      costoTotal: tratamientos.reduce((sum, t) => sum + t.costo, 0),
      costoCompletados: tratamientos.filter(t => t.estado === 'completado').reduce((sum, t) => sum + t.costo, 0)
    };

    res.json({
      success: true,
      data: {
        tratamientos,
        estadisticas
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial de tratamientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial de tratamientos'
    });
  }
});

// POST /api/tratamientos - Crear nuevo tratamiento
router.post('/', async (req, res) => {
  try {
    console.log('🦷 Datos recibidos para crear tratamiento:', req.body);
    
    const { error, value } = tratamientoSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Error de validación:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Datos de tratamiento inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    console.log('✅ Datos validados:', value);

    const tratamiento = new Tratamiento(value);
    await tratamiento.save();
    
    console.log('✅ Tratamiento guardado exitosamente:', tratamiento);

    res.json({
      success: true,
      message: 'Tratamiento creado exitosamente',
      data: tratamiento
    });
  } catch (error) {
    console.error('Error creando tratamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando tratamiento'
    });
  }
});

// PUT /api/tratamientos/:id - Actualizar tratamiento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = tratamientoSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de tratamiento inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const tratamiento = await Tratamiento.findByIdAndUpdate(id, value, { new: true });
    
    if (!tratamiento) {
      return res.status(404).json({
        success: false,
        message: 'Tratamiento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Tratamiento actualizado exitosamente',
      data: tratamiento
    });
  } catch (error) {
    console.error('Error actualizando tratamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando tratamiento'
    });
  }
});

// PUT /api/tratamientos/:id/marcar-completado - Marcar tratamiento como completado
router.put('/:id/marcar-completado', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tratamiento = await Tratamiento.findByIdAndUpdate(
      id, 
      { 
        estado: 'completado', 
        fechaCompletado: new Date() 
      }, 
      { new: true }
    );
    
    if (!tratamiento) {
      return res.status(404).json({
        success: false,
        message: 'Tratamiento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Tratamiento marcado como completado',
      data: tratamiento
    });
  } catch (error) {
    console.error('Error marcando tratamiento como completado:', error);
    res.status(500).json({
      success: false,
      message: 'Error marcando tratamiento como completado'
    });
  }
});

// DELETE /api/tratamientos/:id - Eliminar tratamiento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tratamiento = await Tratamiento.findByIdAndDelete(id);
    
    if (!tratamiento) {
      return res.status(404).json({
        success: false,
        message: 'Tratamiento no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Tratamiento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando tratamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando tratamiento'
    });
  }
});

module.exports = router;