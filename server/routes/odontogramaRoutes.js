const express = require('express');
const router = express.Router();
const Odontograma = require('../models/Odontograma');
const Tratamiento = require('../models/Tratamiento');
const Joi = require('joi');

// Esquema de validación para odontograma
const odontogramaSchema = Joi.object({
  pacienteId: Joi.string().required(),
  fecha: Joi.date().default(Date.now),
  observaciones: Joi.string().max(500).trim(),
  piezasDentales: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      ausente: Joi.boolean().default(false),
      caras: Joi.object({
        derecha: Joi.string().allow(null),
        izquierda: Joi.string().allow(null),
        superior: Joi.string().allow(null),
        inferior: Joi.string().allow(null),
        central: Joi.string().allow(null)
      }).default({}),
      // Mantener compatibilidad con versiones anteriores
      requerido: Joi.string().allow(null),
      existente: Joi.string().allow(null)
    })
  )
});

// GET /api/odontograma/:pacienteId - Obtener odontograma de un paciente
router.get('/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    // Buscar el odontograma en MongoDB
    let odontograma = await Odontograma.findOne({ pacienteId });

    if (!odontograma) {
      // Si no existe, crear uno nuevo vacío
      odontograma = new Odontograma({
        pacienteId,
        fecha: new Date(),
        observaciones: '',
        piezasDentales: {},
        historial: []
      });
      await odontograma.save();
    }

    res.json({
      success: true,
      data: odontograma
    });
  } catch (error) {
    console.error('Error obteniendo odontograma:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo odontograma'
    });
  }
});

// POST /api/odontograma - Guardar estado del odontograma
router.post('/', async (req, res) => {
  try {
    const { pacienteId, observaciones, piezasDentales, fecha } = req.body;
    
    if (!pacienteId) {
      return res.status(400).json({
        success: false,
        message: 'pacienteId es requerido'
      });
    }

    // Buscar odontograma existente o crear uno nuevo
    let odontograma = await Odontograma.findOne({ pacienteId });

    if (!odontograma) {
      odontograma = new Odontograma({
        pacienteId,
        fecha: fecha ? new Date(fecha) : new Date(),
        observaciones: observaciones || '',
        piezasDentales: {},
        historial: []
      });
    } else {
      // Actualizar observaciones si se proporcionan
      if (observaciones !== undefined) {
        odontograma.observaciones = observaciones;
      }
      
      // Actualizar fecha si se proporciona
      if (fecha) {
        odontograma.fecha = new Date(fecha);
      }
    }

    // Actualizar piezas dentales
    if (piezasDentales && typeof piezasDentales === 'object') {
      for (const [pieza, estados] of Object.entries(piezasDentales)) {
        if (!pieza || typeof estados !== 'object' || !estados) {
          continue; // Saltar entradas inválidas
        }
        const estadoActual = odontograma.piezasDentales.get(pieza) || {};
        
        // Registrar cambios en el historial para ausente
        if (estados.ausente !== undefined && estados.ausente !== estadoActual.ausente) {
          const historialEntry = {
            fecha: new Date(),
            pieza,
            tipo: 'ausente',
            estadoAnterior: estadoActual.ausente ? 'ausente' : 'presente',
            estadoNuevo: estados.ausente ? 'ausente' : 'presente'
          };
          if (observaciones) {
            historialEntry.observaciones = observaciones;
          }
          odontograma.historial.push(historialEntry);
        }
        
        // Registrar cambios en las caras
        if (estados.caras && typeof estados.caras === 'object') {
          const carasActuales = estadoActual.caras || {};
          const carasNuevas = estados.caras || {};
          
          for (const [cara, valor] of Object.entries(carasNuevas)) {
            if (cara === 'derecha' || cara === 'izquierda' || cara === 'superior' || cara === 'inferior' || cara === 'central') {
              const valorAnterior = carasActuales[cara] || null;
              const valorNuevo = (valor !== undefined && valor !== null) ? String(valor) : null;
              
              if (valorNuevo !== valorAnterior) {
                const historialEntry = {
                  fecha: new Date(),
                  pieza,
                  tipo: 'cara',
                  cara: cara,
                  estadoAnterior: valorAnterior,
                  estadoNuevo: valorNuevo
                };
                if (observaciones) {
                  historialEntry.observaciones = observaciones;
                }
                odontograma.historial.push(historialEntry);
              }
            }
          }
        }
        
        // Registrar cambios en requerido/existente (compatibilidad)
        if (estados.requerido !== undefined && estados.requerido !== estadoActual.requerido) {
          const historialEntry = {
            fecha: new Date(),
            pieza,
            tipo: 'requerido',
            estadoAnterior: estadoActual.requerido || null,
            estadoNuevo: estados.requerido || null
          };
          if (observaciones) {
            historialEntry.observaciones = observaciones;
          }
          odontograma.historial.push(historialEntry);
        }
        
        if (estados.existente !== undefined && estados.existente !== estadoActual.existente) {
          const historialEntry = {
            fecha: new Date(),
            pieza,
            tipo: 'existente',
            estadoAnterior: estadoActual.existente || null,
            estadoNuevo: estados.existente || null
          };
          if (observaciones) {
            historialEntry.observaciones = observaciones;
          }
          odontograma.historial.push(historialEntry);
        }
        
        // Actualizar el estado de la pieza
        const carasParaGuardar = estados.caras !== undefined ? estados.caras : (estadoActual.caras || {
          derecha: null,
          izquierda: null,
          superior: null,
          inferior: null,
          central: null
        });
        
        // Asegurar que todas las caras tengan valores válidos (null o string)
        // Preservar el valor "=" para extracción
        const carasValidadas = {
          derecha: (carasParaGuardar.derecha !== undefined && carasParaGuardar.derecha !== null) ? String(carasParaGuardar.derecha) : null,
          izquierda: (carasParaGuardar.izquierda !== undefined && carasParaGuardar.izquierda !== null) ? String(carasParaGuardar.izquierda) : null,
          superior: (carasParaGuardar.superior !== undefined && carasParaGuardar.superior !== null) ? String(carasParaGuardar.superior) : null,
          inferior: (carasParaGuardar.inferior !== undefined && carasParaGuardar.inferior !== null) ? String(carasParaGuardar.inferior) : null,
          central: (carasParaGuardar.central !== undefined && carasParaGuardar.central !== null) ? String(carasParaGuardar.central) : null
        };
        
        const nuevoEstado = {
          ausente: estados.ausente !== undefined ? estados.ausente : (estadoActual.ausente !== undefined ? estadoActual.ausente : false),
          caras: carasValidadas,
          requerido: estados.requerido !== undefined ? estados.requerido : estadoActual.requerido,
          existente: estados.existente !== undefined ? estados.existente : estadoActual.existente
        };
        
        odontograma.piezasDentales.set(pieza, nuevoEstado);
      }
    }

    await odontograma.save();

    res.json({
      success: true,
      message: 'Odontograma guardado exitosamente',
      data: odontograma
    });
  } catch (error) {
    console.error('Error guardando odontograma:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: 'Error guardando odontograma',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/odontograma/:id - Actualizar pieza dental específica
router.put('/:id', async (req, res) => {
  try {
    const { pieza, tipo, estado } = req.body;
    
    if (!pieza || !tipo || !estado) {
      return res.status(400).json({
        success: false,
        message: 'Pieza, tipo y estado son requeridos'
      });
    }

    const odontograma = await Odontograma.findById(req.params.id);
    
    if (!odontograma) {
      return res.status(404).json({
        success: false,
        message: 'Odontograma no encontrado'
      });
    }

    // Verificar que la pieza existe
    if (!odontograma.piezasDentales[pieza]) {
      odontograma.piezasDentales[pieza] = { requerido: null, existente: null };
    }

    // Registrar cambio en historial
    const estadoAnterior = odontograma.piezasDentales[pieza][tipo];
    odontograma.historial.push({
      pieza,
      tipo,
      estadoAnterior,
      estadoNuevo: estado,
      observaciones: req.body.observaciones || ''
    });

    // Actualizar estado
    odontograma.piezasDentales[pieza][tipo] = estado;
    
    await odontograma.save();

    res.json({
      success: true,
      message: 'Pieza dental actualizada exitosamente',
      data: odontograma
    });
  } catch (error) {
    console.error('Error actualizando pieza dental:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando pieza dental'
    });
  }
});

// GET /api/odontograma/:pacienteId/historial - Obtener historial de tratamientos
router.get('/:pacienteId/historial', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const odontograma = await Odontograma.findOne({ pacienteId })
      .select('historial fecha observaciones');

    if (!odontograma) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0,
          limit: parseInt(limit)
        }
      });
    }

    // Paginar historial
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const historialPaginado = odontograma.historial.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: historialPaginado,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(odontograma.historial.length / limit),
        total: odontograma.historial.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial'
    });
  }
});

// GET /api/odontograma/:pacienteId/tratamientos - Obtener tratamientos por pieza dental
router.get('/:pacienteId/tratamientos', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { pieza } = req.query;

    let query = { pacienteId };
    if (pieza) {
      query.piezaDental = pieza;
    }

    const tratamientos = await Tratamiento.find(query)
      .sort({ fecha: -1 })
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

module.exports = router;
