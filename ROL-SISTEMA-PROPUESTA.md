# Propuesta de Sistema de Roles y Mejoras de Lógica de Negocio

## 📋 Resumen Ejecutivo

Implementar un sistema de roles y permisos para gestionar accesos diferenciados:
- **Dentista**: Acceso completo (todo)
- **Secretaría**: Gestión de citas y pagos
- **Pacientes**: Consulta de sus propios datos y citas

---

## 🏗️ Arquitectura Propuesta

### 1. Modelo de Usuario y Roles

```javascript
// server/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['dentista', 'secretaria', 'paciente'],
    default: 'secretaria',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  pacienteId: {  // Si es paciente, vincular con Paciente
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente'
  },
  ultimoAcceso: Date,
  intentosFallidos: {
    type: Number,
    default: 0
  },
  bloqueado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar passwords
usuarioSchema.methods.compararPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
```

### 2. Sistema de Autenticación JWT

```javascript
// server/routes/authRoutes.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const usuario = await Usuario.findOne({ email, activo: true });
  if (!usuario) {
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
  
  const esValido = await usuario.compararPassword(password);
  if (!esValido) {
    usuario.intentosFallidos++;
    await usuario.save();
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
  
  // Generar token
  const token = jwt.sign(
    { 
      id: usuario._id, 
      rol: usuario.rol,
      email: usuario.email 
    },
    process.env.JWT_SECRET || 'tu-secret-key',
    { expiresIn: '8h' }
  );
  
  usuario.ultimoAcceso = new Date();
  usuario.intentosFallidos = 0;
  await usuario.save();
  
  res.json({ success: true, token, usuario: { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre } });
});
```

### 3. Middleware de Permisos

```javascript
// server/middleware/permisos.js

// Verificar autenticación
exports.verificarAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

// Verificar rol específico
exports.verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para esta acción' 
      });
    }
    next();
  };
};

// Acceso a recursos del paciente
exports.verificarPropietario = (req, res, next) => {
  const pacienteId = req.params.pacienteId || req.body.pacienteId;
  
  if (req.usuario.rol === 'dentista') {
    // Dentista tiene acceso completo
    return next();
  }
  
  if (req.usuario.rol === 'paciente' && req.usuario.pacienteId?.toString() !== pacienteId) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  next();
};
```

### 4. Aplicar Permisos en Rutas

```javascript
// server/routes/citaRoutes.js
const { verificarAuth, verificarRol } = require('../middleware/permisos');

// Secretaría puede crear, modificar y cancelar citas
router.post('/', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  // Lógica de creación
});

router.get('/:citaId', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  // Lógica de consulta
});

// server/routes/pagoRoutes.js
router.post('/', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  // Solo dentista y secretaría pueden crear pagos
});

// Consultas y tratamientos solo dentista
router.post('/', verificarAuth, verificarRol('dentista'), async (req, res) => {
  // Solo dentista puede crear consultas
});
```

---

## 🔐 Matriz de Permisos

| Funcionalidad | Dentista | Secretaría | Paciente |
|---------------|----------|------------|----------|
| Ver todos los pacientes | ✅ | ✅ | ❌ (solo propios) |
| Crear/Editar pacientes | ✅ | ✅ | ❌ |
| Ver citas | ✅ | ✅ | ✅ (solo propias) |
| Crear/Editar/Cancelar citas | ✅ | ✅ | ❌ |
| Ver consultas | ✅ | ✅ | ✅ (solo propias) |
| Crear consultas | ✅ | ❌ | ❌ |
| Ver pagos | ✅ | ✅ | ✅ (solo propios) |
| Crear pagos | ✅ | ✅ | ❌ |
| Ver tratamientos | ✅ | ✅ | ✅ (solo propios) |
| Crear tratamientos | ✅ | ❌ | ❌ |
| Ver odontograma | ✅ | ✅ | ✅ (solo propio) |
| Editar odontograma | ✅ | ❌ | ❌ |

---

## 💼 Mejoras en Lógica de Negocio

### A. Gestión de Citas

```javascript
// Mejoras propuestas:

1. **Validación de conflictos de horario**
   - Verificar solapamientos de citas
   - Tiempo mínimo entre citas

2. **Estados de citas más detallados**
   - programada → confirmada → en_progreso → completada
   - Sistema de recordatorios automáticos

3. **Gestión de ausencias**
   - Límite de ausencias por paciente
   - Política de cancelaciones

4. **Notificaciones**
   - Email/SMS de confirmación
   - Recordatorios 24h antes
```

### B. Gestión de Pagos

```javascript
// Mejoras propuestas:

1. **Historial financiero completo**
   - Balance de cuentas por paciente
   - Reportes de ingresos por período

2. **Pagos a plazos**
   - Seguimiento de pagos parciales
   - Alertas de pagos pendientes

3. **Comprobantes**
   - Generación automática de tickets
   - Exportación a PDF

4. **Integración de métodos de pago**
   - Pasarelas de pago online
   - Terminales de punto de venta
```

### C. Lógica de Negocio Mejorada

```javascript
// 1. Módulo de Inventario
- Control de stock de materiales
- Alertas de reposición
- Historial de consumo

// 2. Reportes y Analytics
- Dashboard ejecutivo
- Métricas de productividad
- Análisis de rentabilidad

// 3. Gestión de Horarios
- Calendario de disponibilidad
- Configuración de horarios de trabajo
- Vacaciones y días libres

// 4. Comunicación
- Chat interno
- Notificaciones push
- Sistema de mensajería
```

---

## 🎨 Frontend: Context de Autenticación

```typescript
// client/src/contexts/AuthContext.tsx
interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verificarPermiso: (accion: string) => boolean;
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    
    if (data.success) {
      setToken(data.token);
      setUsuario(data.usuario);
      localStorage.setItem('token', data.token);
    }
  };

  const verificarPermiso = (accion: string) => {
    if (!usuario) return false;
    
    const permisos = {
      dentista: ['*'], // Acceso total
      secretaria: ['ver-citas', 'crear-citas', 'ver-pagos', 'crear-pagos'],
      paciente: ['ver-propias-citas', 'ver-propios-datos']
    };
    
    return permisos[usuario.rol]?.includes('*') || 
           permisos[usuario.rol]?.includes(accion);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, verificarPermiso }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 📝 Plan de Implementación

### Fase 1: Fundación (Semana 1)
- ✅ Crear modelo Usuario
- ✅ Implementar autenticación JWT
- ✅ Crear middleware de permisos
- ✅ Sistema de login en frontend

### Fase 2: Roles (Semana 2)
- ✅ Aplicar permisos a rutas existentes
- ✅ Dashboard por rol
- ✅ Componentes condicionales por rol

### Fase 3: Mejoras de Negocio (Semana 3-4)
- ✅ Validaciones mejoradas en citas
- ✅ Sistema de pagos avanzado
- ✅ Reportes y analytics

### Fase 4: Optimización (Semana 5)
- ✅ Performance testing
- ✅ Security audit
- ✅ Documentación completa

---

## 🔒 Seguridad

1. **Protección de rutas sensibles**
2. **Encriptación de datos sensibles**
3. **Rate limiting**
4. **Auditoría de acciones**
5. **Backups automatizados**

---

## 📊 Métricas de Éxito

- Tiempo de login < 2s
- Disponibilidad 99.9%
- Usuarios concurrentes: 50+
- Response time < 100ms



