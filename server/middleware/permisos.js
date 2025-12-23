const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Verificar autenticación
exports.verificarAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado. Token requerido.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado. Token inválido.' 
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secret-key-super-segura-cambiar-en-produccion');
      
      // Obtener usuario completo
      const usuario = await Usuario.findById(decoded.id).select('-password');
      
      if (!usuario || !usuario.activo) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario inactivo o no encontrado.' 
        });
      }
      
      if (usuario.bloqueado && usuario.bloqueadoHasta && new Date() < usuario.bloqueadoHasta) {
        return res.status(403).json({ 
          success: false, 
          message: 'Usuario bloqueado temporalmente.' 
        });
      }
      
      // Agregar usuario al request
      req.usuario = {
        id: usuario._id.toString(),
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
        pacienteId: usuario.pacienteId
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o expirado.' 
      });
    }
  } catch (error) {
    console.error('Error en verificarAuth:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar autenticación.' 
    });
  }
};

// Verificar rol específico
exports.verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }
    
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para esta acción. Rol requerido: ' + roles.join(', ') 
      });
    }
    
    next();
  };
};

// Verificar que el usuario es propietario del recurso (para pacientes)
exports.verificarPropietario = (req, res, next) => {
  const pacienteId = req.params.pacienteId || req.body.pacienteId || req.query.pacienteId;
  
  // Dentista tiene acceso completo
  if (req.usuario.rol === 'dentista') {
    return next();
  }
  
  // Secretaría también tiene acceso a todos los pacientes
  if (req.usuario.rol === 'secretaria') {
    return next();
  }
  
  // Paciente solo puede acceder a sus propios datos
  if (req.usuario.rol === 'paciente' && req.usuario.pacienteId) {
    if (req.usuario.pacienteId.toString() !== pacienteId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para acceder a estos datos.' 
      });
    }
    return next();
  }
  
  return res.status(403).json({ 
    success: false, 
    message: 'Acceso denegado.' 
  });
};

// Middleware opcional para verificar autenticación (no bloquea)
exports.opcionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secret-key-super-segura-cambiar-en-produccion');
        const usuario = await Usuario.findById(decoded.id).select('-password');
        
        if (usuario && usuario.activo) {
          req.usuario = {
            id: usuario._id.toString(),
            email: usuario.email,
            rol: usuario.rol,
            nombre: usuario.nombre,
            pacienteId: usuario.pacienteId
          };
        }
      } catch (error) {
        // Token inválido, pero continuar sin usuario
        req.usuario = null;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};




