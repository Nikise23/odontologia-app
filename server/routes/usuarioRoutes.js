const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { verificarAuth, verificarRol } = require('../middleware/permisos');
const Joi = require('joi');

// Esquema de validación para crear usuario
const crearUsuarioSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('dentista', 'secretaria').required(),
  activo: Joi.boolean().default(true)
});

// Esquema de validación para actualizar usuario
const actualizarUsuarioSchema = Joi.object({
  nombre: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  rol: Joi.string().valid('dentista', 'secretaria'),
  activo: Joi.boolean()
});

// GET /api/usuarios - Obtener todos los usuarios (solo admin)
router.get('/', verificarAuth, verificarRol('admin'), async (req, res) => {
  try {
    const usuarios = await Usuario.find({ rol: { $ne: 'paciente' } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// GET /api/usuarios/:id - Obtener un usuario específico (solo admin)
router.get('/:id', verificarAuth, verificarRol('admin'), async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
});

// POST /api/usuarios - Crear nuevo usuario (solo admin)
router.post('/', verificarAuth, verificarRol('admin'), async (req, res) => {
  try {
    const { error, value } = crearUsuarioSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ email: value.email });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    const usuario = new Usuario(value);
    await usuario.save();
    
    // Retornar usuario sin password
    const usuarioData = await Usuario.findById(usuario._id).select('-password');
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioData
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario (solo admin)
router.put('/:id', verificarAuth, verificarRol('admin'), async (req, res) => {
  try {
    const { error, value } = actualizarUsuarioSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Verificar si el email ya existe en otro usuario
    if (value.email) {
      const usuarioExistente = await Usuario.findOne({ 
        email: value.email,
        _id: { $ne: req.params.id }
      });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado en otro usuario'
        });
      }
    }
    
    // Si se actualiza el password, asegurar que se hashee
    const usuario = await Usuario.findById(req.params.id).select('+password');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar campos
    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        usuario[key] = value[key];
      }
    });
    
    // Si se cambió el password, marcar como modificado para que se hashee
    if (value.password) {
      usuario.markModified('password');
    }
    
    await usuario.save();
    
    // Retornar usuario sin password
    const usuarioData = await Usuario.findById(usuario._id).select('-password');
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioData
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario (solo admin)
router.delete('/:id', verificarAuth, verificarRol('admin'), async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // No permitir eliminar al admin
    if (usuario.rol === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar un usuario administrador'
      });
    }
    
    // En lugar de eliminar, desactivar
    usuario.activo = false;
    await usuario.save();
    
    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario'
    });
  }
});

module.exports = router;

