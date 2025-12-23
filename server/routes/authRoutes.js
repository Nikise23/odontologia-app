const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Joi = require('joi');
const { verificarAuth } = require('../middleware/permisos');

// Esquema de validación para login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Esquema de validación para registro
const registroSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'dentista', 'secretaria', 'paciente').default('secretaria'),
  pacienteId: Joi.string().when('rol', {
    is: 'paciente',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// Esquema de validación para cambio de contraseña
const cambiarPasswordSchema = Joi.object({
  passwordActual: Joi.string().min(6).required(),
  passwordNuevo: Joi.string().min(6).required(),
  confirmarPassword: Joi.string().valid(Joi.ref('passwordNuevo')).required()
    .messages({
      'any.only': 'Las contraseñas no coinciden'
    })
});

// POST /api/auth/login - Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    const { email, password } = value;
    
    // Buscar usuario con password incluido
    const usuario = await Usuario.findOne({ email, activo: true }).select('+password');
    
    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
    
    // Verificar si está bloqueado
    if (usuario.bloqueado && usuario.bloqueadoHasta && new Date() < usuario.bloqueadoHasta) {
      return res.status(403).json({
        success: false,
        message: `Usuario bloqueado hasta ${usuario.bloqueadoHasta.toLocaleString()}`
      });
    }
    
    // Verificar password
    const esValido = await usuario.compararPassword(password);
    
    if (!esValido) {
      usuario.intentosFallidos += 1;
      
      // Bloquear después de 5 intentos fallidos
      if (usuario.intentosFallidos >= 5) {
        usuario.bloqueado = true;
        usuario.bloqueadoHasta = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
        await usuario.save();
        
        return res.status(403).json({
          success: false,
          message: 'Demasiados intentos fallidos. Usuario bloqueado por 30 minutos.'
        });
      }
      
      await usuario.save();
      
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas',
        intentosRestantes: 5 - usuario.intentosFallidos
      });
    }
    
    // Login exitoso - resetear intentos
    usuario.intentosFallidos = 0;
    usuario.bloqueado = false;
    usuario.bloqueadoHasta = undefined;
    usuario.ultimoAcceso = new Date();
    await usuario.save();
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id.toString(), 
        rol: usuario.rol,
        email: usuario.email 
      },
      process.env.JWT_SECRET || 'tu-secret-key-super-segura-cambiar-en-produccion',
      { expiresIn: '8h' }
    );
    
    // Retornar datos del usuario (sin password)
    const usuarioData = await Usuario.findById(usuario._id).select('-password');
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id: usuarioData._id,
          nombre: usuarioData.nombre,
          email: usuarioData.email,
          rol: usuarioData.rol,
          pacienteId: usuarioData.pacienteId
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
});

// POST /api/auth/registro - Registro de nuevo usuario (solo para desarrollo/admin)
router.post('/registro', async (req, res) => {
  try {
    const { error, value } = registroSchema.validate(req.body);
    
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
    
    // Verificar si es paciente y el pacienteId existe
    if (value.rol === 'paciente' && value.pacienteId) {
      const Paciente = require('../models/Paciente');
      const paciente = await Paciente.findById(value.pacienteId);
      if (!paciente) {
        return res.status(400).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }
    }
    
    const usuario = new Usuario(value);
    await usuario.save();
    
    // Generar token
    const token = jwt.sign(
      { 
        id: usuario._id.toString(), 
        rol: usuario.rol,
        email: usuario.email 
      },
      process.env.JWT_SECRET || 'tu-secret-key-super-segura-cambiar-en-produccion',
      { expiresIn: '8h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          pacienteId: usuario.pacienteId
        }
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    });
  }
});

// PUT /api/auth/cambiar-password - Cambiar contraseña del usuario autenticado
router.put('/cambiar-password', verificarAuth, async (req, res) => {
  try {
    
    const { error, value } = cambiarPasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    const { passwordActual, passwordNuevo } = value;
    
    // Obtener usuario con password (usando el ID del token verificado)
    const usuario = await Usuario.findById(req.usuario.id).select('+password');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const esValido = await usuario.compararPassword(passwordActual);
    
    if (!esValido) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }
    
    // Verificar que la nueva contraseña sea diferente
    const esMismaPassword = await usuario.compararPassword(passwordNuevo);
    
    if (esMismaPassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual'
      });
    }
    
    // Actualizar contraseña (se hasheará automáticamente)
    usuario.password = passwordNuevo;
    await usuario.save();
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
});

// GET /api/auth/verificar - Verificar token actual
router.get('/verificar', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secret-key-super-segura-cambiar-en-produccion');
      const usuario = await Usuario.findById(decoded.id).select('-password');
      
      if (!usuario || !usuario.activo) {
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          pacienteId: usuario.pacienteId
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar token'
    });
  }
});

module.exports = router;




