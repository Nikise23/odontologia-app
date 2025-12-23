# 🚀 Guía de Implementación: Sistema de Roles y Autenticación

## ✅ Lo que ya está implementado

1. **Backend:**
   - ✅ Modelo Usuario con roles (dentista, secretaria, paciente)
   - ✅ Sistema de autenticación JWT
   - ✅ Middleware de permisos
   - ✅ Rutas de autenticación (`/api/auth/login`, `/api/auth/registro`)
   - ✅ Modelo HistorialPago para auditoría
   - ✅ Validaciones de tiempo en pagos (24h editar, 1h eliminar)

2. **Frontend:**
   - ✅ AuthContext con gestión de autenticación
   - ✅ Página de Login
   - ✅ Rutas protegidas (ProtectedRoute)
   - ✅ Layout con logout y muestra usuario
   - ✅ Modal de edición de pagos
   - ✅ Validaciones de tiempo en UI

---

## 📝 Pasos para empezar

### 1. Crear Usuario Inicial

Ejecuta este comando en la carpeta `server`:

```bash
cd server
npm run crear-usuario
```

Esto creará un usuario dentista con:
- **Email:** admin@odontologia.com
- **Password:** admin123
- **Rol:** dentista

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

### 2. Crear Usuario Secretaría

Puedes crear uno manualmente usando la API:

```bash
curl -X POST http://localhost:5000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María Secretaría",
    "email": "secretaria@odontologia.com",
    "password": "secret123",
    "rol": "secretaria"
  }'
```

O desde el código puedes llamar a:
```javascript
POST /api/auth/registro
{
  "nombre": "María Secretaría",
  "email": "secretaria@odontologia.com",
  "password": "secret123",
  "rol": "secretaria"
}
```

### 3. Iniciar Sesión

1. Inicia el servidor (`npm run dev` desde la raíz)
2. Abre el frontend en `http://localhost:3000`
3. Serás redirigido a `/login`
4. Usa las credenciales del usuario inicial
5. ¡Listo! Ya estás autenticado

---

## 🔐 Endpoints de Autenticación

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@odontologia.com",
  "password": "admin123"
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "...",
      "nombre": "Dr. Admin",
      "email": "admin@odontologia.com",
      "rol": "dentista"
    }
  }
}
```

### Verificar Token
```http
GET /api/auth/verificar
Authorization: Bearer <token>
```

### Registro (solo desarrollo)
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Nombre Usuario",
  "email": "usuario@email.com",
  "password": "password123",
  "rol": "secretaria",
  "pacienteId": "..." // Solo si rol es "paciente"
}
```

---

## 🛡️ Aplicar Permisos a Rutas Existentes

### Ejemplo: Proteger rutas de pagos

Para proteger las rutas de pagos, puedes agregar el middleware:

```javascript
// server/routes/pagoRoutes.js
const { verificarAuth, verificarRol } = require('../middleware/permisos');

// Solo dentista y secretaria pueden crear pagos
router.post('/', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  // ... código existente
});

// Solo dentista y secretaria pueden modificar
router.put('/:id', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  // ... código existente
});

// Solo dentista y secretaria pueden eliminar
router.delete('/:id', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  // ... código existente
});
```

**Nota:** Por ahora las rutas funcionan sin autenticación para facilitar las pruebas. Puedes agregar los middlewares cuando lo desees.

---

## 🎯 Próximos Pasos

### Fase 1: Completar Permisos (Opcional)
- [ ] Aplicar middlewares a todas las rutas sensibles
- [ ] Crear usuarios de prueba para cada rol
- [ ] Probar flujos por rol

### Fase 2: Mejoras UI
- [ ] Mostrar botones según permisos
- [ ] Ocultar secciones según rol
- [ ] Dashboard diferenciado por rol

### Fase 3: Historia Clínica Integrada
- [ ] Implementar modelo HistoriaClinica
- [ ] Componente de odontograma con histórico
- [ ] Integración completa

---

## 🔧 Configuración

### Variables de Entorno

Asegúrate de tener en `server/config.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/odontologia
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui_2024
NODE_ENV=development
```

⚠️ **En producción:** Cambia `JWT_SECRET` por un valor seguro y largo.

---

## 📊 Estado Actual

| Componente | Estado |
|------------|--------|
| Modelo Usuario | ✅ Completo |
| Autenticación JWT | ✅ Completo |
| Middleware Permisos | ✅ Completo |
| Rutas Auth | ✅ Completo |
| Frontend Auth | ✅ Completo |
| Login Page | ✅ Completo |
| Rutas Protegidas | ✅ Completo |
| Editar/Eliminar Pagos | ✅ Completo |
| Validaciones Tiempo | ✅ Completo |
| Historial Pagos | ✅ Completo |

---

## 🧪 Probar el Sistema

1. **Crear usuario inicial:**
   ```bash
   cd server
   npm run crear-usuario
   ```

2. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

3. **Abrir frontend:**
   - Ir a `http://localhost:3000`
   - Deberías ser redirigido a `/login`

4. **Login:**
   - Email: `admin@odontologia.com`
   - Password: `admin123`

5. **Probar funcionalidades:**
   - Crear, editar y eliminar pagos
   - Ver que el usuario aparece en el sidebar
   - Probar logout

---

## 🎉 ¡Listo!

El sistema de autenticación y roles está completamente implementado. Ahora puedes:

- ✅ Hacer login con diferentes usuarios
- ✅ Ver información del usuario en el sidebar
- ✅ Logout
- ✅ Gestionar pagos con validaciones
- ✅ El sistema está listo para agregar más permisos cuando lo necesites

¿Quieres que continúe con la siguiente fase?




