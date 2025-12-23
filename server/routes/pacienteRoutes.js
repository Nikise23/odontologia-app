const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Paciente = require('../models/Paciente');
const Joi = require('joi');
const { pacientesEjemplo } = require('../data/ejemplo');

// Variable para almacenar datos en memoria
let pacientesEnMemoria = [...pacientesEjemplo];
let siguienteId = 6;

// Esquema de validación para paciente
const pacienteSchema = Joi.object({
  nombre: Joi.string().required().max(100).trim(),
  ci: Joi.string().required().max(20).trim(),
  alergias: Joi.string().max(200).trim().allow('').default('Ninguna'),
  edad: Joi.number().min(0).max(120).allow(null),
  fechaNacimiento: Joi.date().allow(null, ''),
  telefono: Joi.string().max(20).trim().allow('', null),
  email: Joi.string().email().trim().lowercase().allow('', null),
  direccion: Joi.string().max(200).trim().allow('', null),
  ocupacion: Joi.string().max(100).trim().allow('', null),
  estadoCivil: Joi.string().max(50).trim().allow('', null),
  genero: Joi.string().max(20).trim().allow('', null),
  anamnesis: Joi.object({
    diabetes: Joi.boolean().default(false),
    hipertension: Joi.boolean().default(false),
    cardiopatia: Joi.boolean().default(false),
    embarazo: Joi.boolean().default(false),
    medicamentos: Joi.string().trim().allow('').default('Ninguno'),
    antecedentesFamiliares: Joi.string().trim().allow('').default('Ninguno'),
    observacionesMedicas: Joi.string().trim().allow('').default('')
  }).default({}),
  fechaRegistro: Joi.date().optional(),
  _id: Joi.string().optional(),
  updatedAt: Joi.date().optional(),
  createdAt: Joi.date().optional()
});

// GET /api/pacientes - Listar pacientes con búsqueda y filtrado
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'fechaRegistro', 
      sortOrder = 'desc' 
    } = req.query;

    // Usar MongoDB si está disponible, sino usar datos en memoria
    let pacientes;
    let total;
    
    if (mongoose.connection.readyState === 1) {
      // MongoDB está conectado
      const query = search 
        ? {
            $or: [
              { nombre: { $regex: search, $options: 'i' } },
              { ci: { $regex: search, $options: 'i' } }
            ]
          }
        : {};
      
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      pacientes = await Paciente.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      total = await Paciente.countDocuments(query);
    } else {
      // Usar datos en memoria
      let pacientesMemoria = [...pacientesEnMemoria];
      
      // Búsqueda por nombre o CI
      if (search) {
        pacientesMemoria = pacientesMemoria.filter(p => 
          p.nombre.toLowerCase().includes(search.toLowerCase()) ||
          p.ci.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Ordenamiento
      pacientesMemoria.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });

      // Paginación
      total = pacientesMemoria.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      pacientes = pacientesMemoria.slice(startIndex, endIndex);
    }

    res.json({
      success: true,
      data: pacientes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pacientes'
    });
  }
});

// GET /api/pacientes/:id - Obtener paciente por ID
router.get('/:id', async (req, res) => {
  try {
    let paciente;
    
    if (mongoose.connection.readyState === 1) {
      // MongoDB está conectado
      paciente = await Paciente.findById(req.params.id);
    } else {
      // Usar datos en memoria
      paciente = pacientesEnMemoria.find(p => p._id === req.params.id);
    }
    
    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: paciente
    });
  } catch (error) {
    console.error('Error obteniendo paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo paciente'
    });
  }
});

// POST /api/pacientes - Crear nuevo paciente
router.post('/', async (req, res) => {
  try {
    // Limpiar datos: convertir strings vacíos a null para campos opcionales
    const cleanedData = { ...req.body };
    if (cleanedData.fechaNacimiento === '') cleanedData.fechaNacimiento = null;
    if (cleanedData.telefono === '') cleanedData.telefono = null;
    if (cleanedData.email === '') cleanedData.email = null;
    if (cleanedData.direccion === '') cleanedData.direccion = null;
    if (cleanedData.ocupacion === '') cleanedData.ocupacion = null;
    if (cleanedData.estadoCivil === '') cleanedData.estadoCivil = null;
    if (cleanedData.genero === '') cleanedData.genero = null;
    
    const { error, value } = pacienteSchema.validate(cleanedData);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Calcular edad si se proporciona fecha de nacimiento
    // Usar UTC para evitar problemas de zona horaria
    if (value.fechaNacimiento && !value.edad) {
      const hoy = new Date();
      let nacimiento;
      if (typeof value.fechaNacimiento === 'string' && value.fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Es formato YYYY-MM-DD, crear fecha en UTC
        const [year, month, day] = value.fechaNacimiento.split('-').map(Number);
        nacimiento = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      } else {
        nacimiento = new Date(value.fechaNacimiento);
      }
      // Calcular edad usando UTC
      const hoyUTC = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
      const nacimientoUTC = new Date(Date.UTC(nacimiento.getUTCFullYear(), nacimiento.getUTCMonth(), nacimiento.getUTCDate()));
      value.edad = hoyUTC.getUTCFullYear() - nacimientoUTC.getUTCFullYear();
      // Ajustar edad si aún no ha cumplido años
      const mesDiferencia = hoyUTC.getUTCMonth() - nacimientoUTC.getUTCMonth();
      if (mesDiferencia < 0 || (mesDiferencia === 0 && hoyUTC.getUTCDate() < nacimientoUTC.getUTCDate())) {
        value.edad--;
      }
    }
    
    // Normalizar fechaNacimiento para guardar correctamente
    // Crear fecha a medianoche UTC para evitar problemas de zona horaria
    if (value.fechaNacimiento && typeof value.fechaNacimiento === 'string' && value.fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = value.fechaNacimiento.split('-').map(Number);
      // Crear fecha en UTC a medianoche para evitar desfase de un día
      value.fechaNacimiento = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    } else if (value.fechaNacimiento && value.fechaNacimiento instanceof Date) {
      // Si ya es Date, asegurarse de que esté en UTC medianoche
      const year = value.fechaNacimiento.getUTCFullYear();
      const month = value.fechaNacimiento.getUTCMonth();
      const day = value.fechaNacimiento.getUTCDate();
      value.fechaNacimiento = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    }

    let nuevoPaciente;
    
    if (mongoose.connection.readyState === 1) {
      // MongoDB está conectado
      nuevoPaciente = new Paciente({
        ...value,
        fechaRegistro: new Date()
      });
      await nuevoPaciente.save();
    } else {
      // Usar datos en memoria
      nuevoPaciente = {
        _id: siguienteId.toString(),
        ...value,
        fechaRegistro: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      pacientesEnMemoria.push(nuevoPaciente);
      siguienteId++;
    }

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: nuevoPaciente
    });
  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando paciente'
    });
  }
});

// PUT /api/pacientes/:id - Actualizar paciente
router.put('/:id', async (req, res) => {
  try {
    console.log('Datos recibidos para actualizar:', req.body);
    
    // Limpiar datos: convertir strings vacíos a null para campos opcionales
    const cleanedData = { ...req.body };
    if (cleanedData.fechaNacimiento === '') cleanedData.fechaNacimiento = null;
    if (cleanedData.telefono === '') cleanedData.telefono = null;
    if (cleanedData.email === '') cleanedData.email = null;
    if (cleanedData.direccion === '') cleanedData.direccion = null;
    if (cleanedData.ocupacion === '') cleanedData.ocupacion = null;
    if (cleanedData.estadoCivil === '') cleanedData.estadoCivil = null;
    if (cleanedData.genero === '') cleanedData.genero = null;
    
    const { error, value } = pacienteSchema.validate(cleanedData);
    
    if (error) {
      console.log('Error de validación:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Calcular edad si se proporciona fecha de nacimiento
    // Usar UTC para evitar problemas de zona horaria
    if (value.fechaNacimiento && !value.edad) {
      const hoy = new Date();
      let nacimiento;
      if (typeof value.fechaNacimiento === 'string' && value.fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Es formato YYYY-MM-DD, crear fecha en UTC
        const [year, month, day] = value.fechaNacimiento.split('-').map(Number);
        nacimiento = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      } else {
        nacimiento = new Date(value.fechaNacimiento);
      }
      // Calcular edad usando UTC
      const hoyUTC = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
      const nacimientoUTC = new Date(Date.UTC(nacimiento.getUTCFullYear(), nacimiento.getUTCMonth(), nacimiento.getUTCDate()));
      value.edad = hoyUTC.getUTCFullYear() - nacimientoUTC.getUTCFullYear();
      // Ajustar edad si aún no ha cumplido años
      const mesDiferencia = hoyUTC.getUTCMonth() - nacimientoUTC.getUTCMonth();
      if (mesDiferencia < 0 || (mesDiferencia === 0 && hoyUTC.getUTCDate() < nacimientoUTC.getUTCDate())) {
        value.edad--;
      }
    }
    
    // Normalizar fechaNacimiento para guardar correctamente
    // Crear fecha a medianoche UTC para evitar problemas de zona horaria
    if (value.fechaNacimiento && typeof value.fechaNacimiento === 'string' && value.fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = value.fechaNacimiento.split('-').map(Number);
      // Crear fecha en UTC a medianoche para evitar desfase de un día
      value.fechaNacimiento = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    } else if (value.fechaNacimiento && value.fechaNacimiento instanceof Date) {
      // Si ya es Date, asegurarse de que esté en UTC medianoche
      const year = value.fechaNacimiento.getUTCFullYear();
      const month = value.fechaNacimiento.getUTCMonth();
      const day = value.fechaNacimiento.getUTCDate();
      value.fechaNacimiento = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    }

    let pacienteActualizado;
    
    if (mongoose.connection.readyState === 1) {
      // MongoDB está conectado
      pacienteActualizado = await Paciente.findByIdAndUpdate(
        req.params.id,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!pacienteActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }
    } else {
      // Usar datos en memoria
      const pacienteIndex = pacientesEnMemoria.findIndex(p => p._id === req.params.id);
      
      if (pacienteIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      pacienteActualizado = {
        ...pacientesEnMemoria[pacienteIndex],
        ...value,
        updatedAt: new Date()
      };

      pacientesEnMemoria[pacienteIndex] = pacienteActualizado;
    }

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: pacienteActualizado
    });
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un paciente con esta cédula de identidad'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error actualizando paciente'
    });
  }
});

// DELETE /api/pacientes/:id - Eliminar paciente
router.delete('/:id', async (req, res) => {
  try {
    let pacienteEliminado;
    
    if (mongoose.connection.readyState === 1) {
      // MongoDB está conectado
      pacienteEliminado = await Paciente.findByIdAndDelete(req.params.id);
      
      if (!pacienteEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }
    } else {
      // Usar datos en memoria
      const index = pacientesEnMemoria.findIndex(p => p._id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      pacienteEliminado = pacientesEnMemoria[index];
      pacientesEnMemoria.splice(index, 1);
    }

    res.json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando paciente'
    });
  }
});

module.exports = router;
