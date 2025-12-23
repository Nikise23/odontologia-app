const express = require('express');
const router = express.Router();
const Pago = require('../models/Pago');
const Consulta = require('../models/Consulta');
const Tratamiento = require('../models/Tratamiento');
const Joi = require('joi');
const HistorialPago = require('../models/HistorialPago');
const { verificarAuth, verificarRol, verificarPropietario, opcionalAuth } = require('../middleware/permisos');

// Esquema de validación para pago
const pagoSchema = Joi.object({
  pacienteId: Joi.string().required(),
  consultaId: Joi.string().allow(''),
  tratamientoId: Joi.string().allow(''),
  fecha: Joi.date().default(Date.now),
  tipoPago: Joi.string().valid('consulta', 'tratamiento', 'parcial', 'total').required(),
  concepto: Joi.string().max(200).required(),
  monto: Joi.number().min(0).required(),
  estado: Joi.string().valid('pendiente', 'pagado', 'cancelado').default('pendiente'),
  metodoPago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia', 'cheque').default('efectivo'),
  observaciones: Joi.string().max(500).trim().allow(''),
  tratamientosDetalle: Joi.array().items(
    Joi.object({
      piezaDental: Joi.string(),
      tratamiento: Joi.string(),
      costo: Joi.number().min(0),
      pagado: Joi.number().min(0).default(0)
    })
  )
});

// GET /api/pagos - Obtener todos los pagos (con filtros) - Requiere auth
router.get('/', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  try {
    const { pacienteId, startDate, endDate, estado, metodoPago } = req.query;
    
    const filtros = {};
    if (pacienteId) filtros.pacienteId = pacienteId;
    if (estado) filtros.estado = estado;
    if (metodoPago) filtros.metodoPago = metodoPago;
    if (startDate || endDate) {
      filtros.fecha = {};
      if (startDate) filtros.fecha.$gte = new Date(startDate);
      if (endDate) filtros.fecha.$lte = new Date(endDate);
    }
    
    const pagos = await Pago.find(filtros)
      .populate('pacienteId', 'nombre apellido')
      .populate('consultaId', 'numeroConsulta motivoConsulta fecha')
      .populate('tratamientoId', 'nombre piezaDental')
      .sort({ fecha: -1 })
      .select('-__v');
    
    // Calcular totales
    const totales = {
      total: pagos.reduce((sum, p) => sum + p.monto, 0),
      pagados: pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0),
      pendientes: pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0),
      cancelados: pagos.filter(p => p.estado === 'cancelado').reduce((sum, p) => sum + p.monto, 0)
    };
    
    res.json({
      success: true,
      data: pagos,
      totales
    });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pagos'
    });
  }
});

// GET /api/pagos/paciente/:pacienteId - Obtener todos los pagos de un paciente (con auth opcional para pacientes)
router.get('/paciente/:pacienteId', opcionalAuth, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    // Verificar permisos si hay usuario autenticado
    if (req.usuario) {
      // Si es paciente, solo puede ver sus propios pagos
      if (req.usuario.rol === 'paciente' && req.usuario.pacienteId?.toString() !== pacienteId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estos pagos'
        });
      }
    }
    
    const pagos = await Pago.find({ pacienteId })
      .populate('consultaId', 'numeroConsulta motivoConsulta fecha costoConsulta')
      .populate('tratamientoId', 'nombre piezaDental costo estado')
      .sort({ fecha: -1 })
      .select('-__v');

    // Agregar información de saldo para pagos de tratamientos
    const pagosConSaldo = await Promise.all(pagos.map(async (pago) => {
      const pagoObj = pago.toObject();
      
      // Si es pago de tratamiento, calcular saldo restante
      if (pago.tratamientoId && pago.tratamientoId.costo) {
        const tratamientoId = pago.tratamientoId._id || pago.tratamientoId;
        const tratamiento = await Tratamiento.findById(tratamientoId);
        
        if (tratamiento) {
          const pagosTratamiento = await Pago.find({
            tratamientoId: tratamiento._id,
            estado: { $ne: 'cancelado' }
          });
          
          const totalPagado = pagosTratamiento.reduce((sum, p) => sum + (p.monto || 0), 0);
          const saldoPendiente = tratamiento.costo - totalPagado;
          
          pagoObj.saldoTratamiento = {
            costoTotal: tratamiento.costo,
            totalPagado,
            saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0,
            estaCompletamentePagado: saldoPendiente <= 0
          };
        }
      }
      
      return pagoObj;
    }));

    res.json({
      success: true,
      data: pagosConSaldo
    });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pagos'
    });
  }
});

// GET /api/pagos/id/:pagoId - Obtener un pago específico
router.get('/id/:pagoId', opcionalAuth, async (req, res) => {
  try {
    const { pagoId } = req.params;
    
    const pago = await Pago.findById(pagoId)
      .populate('pacienteId', 'nombre apellido')
      .populate('consultaId', 'numeroConsulta motivoConsulta fecha costoConsulta')
      .populate('tratamientoId', 'nombre piezaDental costo estado')
      .select('-__v');
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    // Verificar permisos si hay usuario autenticado
    if (req.usuario) {
      if (req.usuario.rol === 'paciente' && req.usuario.pacienteId?.toString() !== pago.pacienteId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este pago'
        });
      }
    }
    
    res.json({
      success: true,
      data: pago
    });
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pago'
    });
  }
});

// GET /api/pagos/historial/:pacienteId - Obtener historial completo de pagos
router.get('/historial/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    const pagos = await Pago.find({ pacienteId })
      .populate('consultaId', 'numeroConsulta motivoConsulta fecha costoConsulta')
      .populate('tratamientoId', 'nombre piezaDental costo estado')
      .sort({ fecha: -1 })
      .select('-__v');

    // Agregar información de saldo para pagos de tratamientos
    const pagosConSaldo = await Promise.all(pagos.map(async (pago) => {
      const pagoObj = pago.toObject();
      
      // Si es pago de tratamiento, calcular saldo restante
      if (pago.tratamientoId && (pago.tratamientoId.costo || (pago.tratamientoId._id))) {
        const tratamientoId = pago.tratamientoId._id || pago.tratamientoId;
        const tratamiento = await Tratamiento.findById(tratamientoId);
        
        if (tratamiento && tratamiento.costo) {
          const pagosTratamiento = await Pago.find({
            tratamientoId: tratamiento._id,
            estado: { $ne: 'cancelado' }
          });
          
          const totalPagado = pagosTratamiento.reduce((sum, p) => sum + (p.monto || 0), 0);
          const saldoPendiente = tratamiento.costo - totalPagado;
          
          pagoObj.saldoTratamiento = {
            costoTotal: tratamiento.costo,
            totalPagado,
            saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0,
            estaCompletamentePagado: saldoPendiente <= 0
          };
        }
      }
      
      return pagoObj;
    }));

    // Calcular estadísticas
    const estadisticas = {
      totalPagado: pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0),
      totalPendiente: pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0),
      totalConsultas: pagos.filter(p => p.tipoPago === 'consulta').length,
      totalTratamientos: pagos.filter(p => p.tipoPago === 'tratamiento' || p.tipoPago === 'parcial' || p.tipoPago === 'total').length
    };

    res.json({
      success: true,
      data: {
        pagos: pagosConSaldo,
        estadisticas
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial de pagos'
    });
  }
});

// POST /api/pagos - Crear nuevo pago
router.post('/', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  try {
    console.log('💰 Datos recibidos para crear pago:', req.body);
    
    const { error, value } = pagoSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Error de validación:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Datos de pago inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Si es pago de tratamiento, validar saldo pendiente
    if (value.tratamientoId && (value.tipoPago === 'tratamiento' || value.tipoPago === 'parcial')) {
      const tratamiento = await Tratamiento.findById(value.tratamientoId);
      if (!tratamiento) {
        return res.status(404).json({
          success: false,
          message: 'Tratamiento no encontrado'
        });
      }
      
      // Calcular total pagado
      const pagosExistentes = await Pago.find({
        tratamientoId: value.tratamientoId,
        estado: { $ne: 'cancelado' }
      });
      
      const totalPagado = pagosExistentes.reduce((sum, p) => sum + (p.monto || 0), 0);
      const saldoPendiente = tratamiento.costo - totalPagado;
      
      // Validar que el monto no exceda el saldo pendiente
      if (value.monto > saldoPendiente) {
        return res.status(400).json({
          success: false,
          message: `El monto excede el saldo pendiente. Saldo disponible: $${saldoPendiente.toLocaleString()}`,
          saldoPendiente
        });
      }
      
      // Si es pago total, verificar que el monto sea exactamente el saldo pendiente
      if (value.tipoPago === 'total' && value.monto !== saldoPendiente) {
        return res.status(400).json({
          success: false,
          message: `Para un pago total, el monto debe ser exactamente $${saldoPendiente.toLocaleString()}`,
          saldoPendiente
        });
      }
    }
    
    console.log('✅ Datos validados:', value);

    const pago = new Pago({
      ...value,
      usuarioCreador: req.usuario.id,
      rolCreador: req.usuario.rol
    });
    await pago.save();
    
    // Log en historial
    try {
      await HistorialPago.create({
        pagoId: pago._id,
        accion: 'creado',
        usuarioId: req.usuario.id,
        rol: req.usuario.rol,
        datosNuevos: pago.toObject(),
        fecha: new Date()
      });
    } catch (e) {
      console.warn('No se pudo registrar historial de pago (creado):', e.message);
    }
    
    console.log('✅ Pago guardado exitosamente:', pago);

    res.json({
      success: true,
      message: 'Pago creado exitosamente',
      data: pago
    });
  } catch (error) {
    console.error('Error creando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando pago'
    });
  }
});

// PUT /api/pagos/:id - Actualizar pago
router.put('/:id', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = pagoSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de pago inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Obtener pago anterior
    const pagoAnterior = await Pago.findById(id);
    if (!pagoAnterior) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

    // Validar tiempo: solo se pueden modificar pagos de menos de 24 horas
    const horasDesdeCreacion = (new Date() - pagoAnterior.createdAt) / (1000 * 60 * 60);
    if (horasDesdeCreacion > 24) {
      return res.status(403).json({
        success: false,
        message: 'Solo se pueden modificar pagos con menos de 24 horas de antigüedad'
      });
    }

    const pago = await Pago.findByIdAndUpdate(id, value, { new: true });
    
    // Log de historial
    try {
      const HistorialPago = require('../models/HistorialPago');
      await HistorialPago.create({
        pagoId: id,
        accion: 'modificado',
        usuarioId: req.usuario?.id,
        rol: req.usuario?.rol || 'sistema',
        datosAnteriores: pagoAnterior.toObject(),
        datosNuevos: pago.toObject(),
        fecha: new Date()
      });
    } catch (e) {
      console.warn('No se pudo registrar historial de pago (modificado):', e.message);
    }

    res.json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: pago
    });
  } catch (error) {
    console.error('Error actualizando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando pago'
    });
  }
});

// PUT /api/pagos/:id/marcar-pagado - Marcar pago como pagado
router.put('/:id/marcar-pagado', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pago = await Pago.findByIdAndUpdate(
      id, 
      { estado: 'pagado', fecha: new Date() }, 
      { new: true }
    );
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Pago marcado como pagado',
      data: pago
    });
  } catch (error) {
    console.error('Error marcando pago como pagado:', error);
    res.status(500).json({
      success: false,
      message: 'Error marcando pago como pagado'
    });
  }
});

// DELETE /api/pagos/:id - Eliminar pago
router.delete('/:id', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener pago antes de eliminar
    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

    const rolUsuario = req.usuario?.rol || 'sistema';

    // Log antes de eliminar
    try {
      const HistorialPago = require('../models/HistorialPago');
      await HistorialPago.create({
        pagoId: id,
        accion: 'eliminado',
        usuarioId: req.usuario?.id,
        rol: rolUsuario,
        datosAnteriores: pago.toObject(),
        razon: req.body?.razon || 'No especificada',
        fecha: new Date()
      });
    } catch (e) {
      console.warn('No se pudo registrar historial de pago (eliminado):', e.message);
    }

    await pago.deleteOne();

    res.json({
      success: true,
      message: 'Pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando pago'
    });
  }
});

// GET /api/pagos/:pagoId/historial - Obtener historial de cambios de un pago
router.get('/:pagoId/historial', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  try {
    const { pagoId } = req.params;
    
    const historial = await HistorialPago.find({ pagoId })
      .populate('usuarioId', 'nombre email')
      .sort({ fecha: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: historial
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial'
    });
  }
});

// GET /api/pagos/reporte - Generar reporte financiero
router.get('/reporte/financiero', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    
    const filtros = {};
    if (fechaDesde || fechaHasta) {
      filtros.fecha = {};
      if (fechaDesde) {
        // Establecer inicio del día en UTC
        const fechaDesdeDate = new Date(fechaDesde);
        fechaDesdeDate.setUTCHours(0, 0, 0, 0);
        filtros.fecha.$gte = fechaDesdeDate;
      }
      if (fechaHasta) {
        // Establecer fin del día en UTC
        const fechaHastaDate = new Date(fechaHasta);
        fechaHastaDate.setUTCHours(23, 59, 59, 999);
        filtros.fecha.$lte = fechaHastaDate;
      }
    }
    
    const pagos = await Pago.find(filtros)
      .populate('pacienteId', 'nombre apellido')
      .sort({ fecha: -1 });
    
    console.log('Filtros aplicados:', JSON.stringify(filtros, null, 2));
    console.log('Cantidad de pagos encontrados:', pagos.length);
    if (pagos.length > 0) {
      console.log('Primer pago ejemplo:', {
        fecha: pagos[0].fecha,
        monto: pagos[0].monto,
        estado: pagos[0].estado,
        metodoPago: pagos[0].metodoPago
      });
    }
    
    // Estadísticas - asegurar que siempre sean números
    const estadisticas = {
      total: pagos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0),
      porEstado: {
        pagado: pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + (Number(p.monto) || 0), 0),
        pendiente: pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + (Number(p.monto) || 0), 0),
        cancelado: pagos.filter(p => p.estado === 'cancelado').reduce((sum, p) => sum + (Number(p.monto) || 0), 0)
      },
      porMetodo: {
        efectivo: pagos.filter(p => p.metodoPago === 'efectivo').reduce((sum, p) => sum + (Number(p.monto) || 0), 0),
        tarjeta: pagos.filter(p => p.metodoPago === 'tarjeta').reduce((sum, p) => sum + (Number(p.monto) || 0), 0),
        transferencia: pagos.filter(p => p.metodoPago === 'transferencia').reduce((sum, p) => sum + (Number(p.monto) || 0), 0),
        cheque: pagos.filter(p => p.metodoPago === 'cheque').reduce((sum, p) => sum + (Number(p.monto) || 0), 0)
      },
      cantidadTotal: pagos.length,
      cantidadPagados: pagos.filter(p => p.estado === 'pagado').length,
      cantidadPendientes: pagos.filter(p => p.estado === 'pendiente').length
    };
    
    console.log('Estadísticas calculadas:', estadisticas);
    
    res.json({
      success: true,
      data: {
        pagos,
        estadisticas,
        periodo: {
          desde: fechaDesde || 'Todos',
          hasta: fechaHasta || 'Todos'
        }
      }
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando reporte'
    });
  }
});

// GET /api/pagos/paciente/:pacienteId/deudas - Obtener deudas pendientes
router.get('/paciente/:pacienteId/deudas', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    // Obtener todas las consultas y tratamientos pendientes
    const Consulta = require('../models/Consulta');
    const Tratamiento = require('../models/Tratamiento');
    
    const consultas = await Consulta.find({ 
      pacienteId, 
      estado: { $in: ['pendiente', 'completada'] } 
    });
    
    const tratamientos = await Tratamiento.find({ 
      pacienteId, 
      estado: { $in: ['programado', 'en_proceso', 'completado'] } 
    });
    
    // Calcular deudas para cada consulta
    const deudasConsultas = await Promise.all(consultas.map(async (consulta) => {
      const pagosConsulta = await Pago.find({ 
        consultaId: consulta._id,
        estado: { $ne: 'cancelado' }
      });
      
      const totalPagado = pagosConsulta.reduce((sum, p) => sum + (p.monto || 0), 0);
      const saldoPendiente = consulta.costoTotal + consulta.costoConsulta - totalPagado;
      
      return {
        tipo: 'consulta',
        consultaId: consulta._id,
        numeroConsulta: consulta.numeroConsulta,
        fecha: consulta.fecha,
        descripcion: consulta.motivoConsulta || 'Consulta',
        montoTotal: consulta.costoTotal + consulta.costoConsulta,
        montoPagado: totalPagado,
        saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0,
        estado: consulta.estado
      };
    }));
    
    // Calcular deudas para cada tratamiento
    const deudasTratamientos = await Promise.all(tratamientos.map(async (tratamiento) => {
      const pagosTratamiento = await Pago.find({ 
        tratamientoId: tratamiento._id,
        estado: { $ne: 'cancelado' }
      });
      
      const totalPagado = pagosTratamiento.reduce((sum, p) => sum + (p.monto || 0), 0);
      const saldoPendiente = tratamiento.costo - totalPagado;
      
      return {
        tipo: 'tratamiento',
        tratamientoId: tratamiento._id,
        nombre: tratamiento.nombre,
        piezaDental: tratamiento.piezaDental,
        fecha: tratamiento.fechaProgramada,
        descripcion: tratamiento.nombre,
        montoTotal: tratamiento.costo,
        montoPagado: totalPagado,
        saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0,
        estado: tratamiento.estado
      };
    }));
    
    // Filtrar solo deudas pendientes
    const deudas = [...deudasConsultas, ...deudasTratamientos]
      .filter(d => d.saldoPendiente > 0);
    
    const totalPendiente = deudas.reduce((sum, d) => sum + d.saldoPendiente, 0);
    
    res.json({
      success: true,
      data: {
        deudas,
        totalPendiente,
        totalDeudas: deudas.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo deudas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo deudas'
    });
  }
});

// GET /api/pagos/tratamiento/:tratamientoId/saldo - Obtener saldo pendiente de un tratamiento
router.get('/tratamiento/:tratamientoId/saldo', async (req, res) => {
  try {
    const { tratamientoId } = req.params;
    
    const tratamiento = await Tratamiento.findById(tratamientoId);
    if (!tratamiento) {
      return res.status(404).json({
        success: false,
        message: 'Tratamiento no encontrado'
      });
    }
    
    // Obtener todos los pagos del tratamiento (excepto cancelados)
    const pagos = await Pago.find({
      tratamientoId,
      estado: { $ne: 'cancelado' }
    });
    
    const totalPagado = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);
    const saldoPendiente = tratamiento.costo - totalPagado;
    
    res.json({
      success: true,
      data: {
        tratamientoId: tratamiento._id,
        nombre: tratamiento.nombre,
        costoTotal: tratamiento.costo,
        totalPagado,
        saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0,
        estaCompletamentePagado: saldoPendiente <= 0,
        cantidadPagos: pagos.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo saldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo saldo del tratamiento'
    });
  }
});

// POST /api/pagos/consultar-cobro - Verificar si debe cobrar consulta
router.post('/consultar-cobro', async (req, res) => {
  try {
    const { pacienteId, consultaId } = req.body;
    
    // Verificar si el paciente tiene tratamientos pendientes de pago
    const Tratamiento = require('../models/Tratamiento');
    const tratamientosPendientes = await Tratamiento.find({ 
      pacienteId,
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
    
    // Si tiene deuda en tratamientos, no cobrar consulta
    const debeCobrarConsulta = !tieneDeudaTratamientos;
    
    res.json({
      success: true,
      data: {
        debeCobrarConsulta,
        tieneDeudaTratamientos
      }
    });
  } catch (error) {
    console.error('Error consultando cobro:', error);
    res.status(500).json({
      success: false,
      message: 'Error consultando cobro'
    });
  }
});

module.exports = router;