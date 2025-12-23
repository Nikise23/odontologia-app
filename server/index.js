const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const odontogramaRoutes = require('./routes/odontogramaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const tratamientoRoutes = require('./routes/tratamientoRoutes');
const consultaRoutes = require('./routes/consultaRoutes');
const citaRoutes = require('./routes/citaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// Configurar trust proxy para Render y otros proxies
// Esto es necesario para que express-rate-limit funcione correctamente
app.set('trust proxy', true);

// Middleware de seguridad
// Configurar helmet para producción (servir archivos estáticos)
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false, // Permitir que React funcione correctamente
  }));
} else {
  app.use(helmet());
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Middleware
// Configuración CORS
// En producción con frontend y backend juntos, no necesitamos CORS estricto
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true // Permitir mismo origen cuando están juntos
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conectar a MongoDB (opcional - puede funcionar sin conexión)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Conectado a MongoDB');
  })
  .catch((error) => {
    console.warn('⚠️ MongoDB no disponible, usando datos en memoria:', error.message);
  });
} else {
  console.log('⚠️ MongoDB no configurado, usando datos en memoria');
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/odontograma', odontogramaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/tratamientos', tratamientoRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/citas', citaRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API de Sistema Dental funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} ya existe`
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// En producción, servir archivos estáticos del frontend
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos de React
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  
  // Para todas las rutas que no sean /api, servir index.html de React
  app.get('*', (req, res) => {
    // Si es una ruta de API, devolver 404
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        message: 'Ruta API no encontrada'
      });
    }
    // Para cualquier otra ruta, servir el index.html de React (SPA routing)
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // En desarrollo, solo manejar rutas API
  app.use('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({
        success: false,
        message: 'Ruta API no encontrada'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📱 API disponible en: http://localhost:${PORT}/api`);
});

module.exports = app;
