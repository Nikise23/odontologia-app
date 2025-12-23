# Implementación de Consultas y Pagos - Sistema Odontológico

## 📋 Descripción General

Esta implementación completa los módulos de **Consultas** y **Pagos** de un sistema de gestión odontológica, incluyendo lógica de cobro condicional, gestión de historial médico, gestión de odontograma dinámico, y herramientas de gestión financiera completas.

## 🏗️ Esquema de Base de Datos

### Tabla: Paciente
```javascript
{
  _id: ObjectId,
  nombre: String (requerido),
  ci: String (requerido, único),
  alergias: String,
  edad: Number,
  fechaNacimiento: Date,
  telefono: String,
  email: String,
  direccion: String,
  anamnesis: {
    diabetes: Boolean,
    hipertension: Boolean,
    cardiopatia: Boolean,
    embarazo: Boolean,
    medicamentos: String,
    antecedentesFamiliares: String,
    observacionesMedicas: String
  },
  fechaRegistro: Date,
  activo: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Tabla: Consulta
```javascript
{
  _id: ObjectId,
  pacienteId: ObjectId (ref: Paciente),
  numeroConsulta: Number (requerido),
  fecha: Date (requerido),
  motivoConsulta: String,
  diagnostico: String,
  tratamientosRealizados: [{
    piezaDental: String (requerido),
    tratamiento: String (requerido),
    costo: Number (requerido, min: 0),
    observaciones: String
  }],
  costoTotal: Number (auto-calculado),
  costoConsulta: Number (requerido),
  estado: 'pendiente' | 'completada' | 'cancelada',
  observacionesGenerales: String,
  cambiosOdontograma: String,
  odontogramaSnapshot: Mixed,  // ✨ NUEVO: Estado completo del odontograma
  anamnesis: {                 // ✨ NUEVO: Datos médicos completos
    sintomas: String,
    alergias: String,
    medicamentos: String,
    antecedentesClinicos: String,
    examenFisico: String,
    planTratamiento: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Tabla: Tratamiento
```javascript
{
  _id: ObjectId,
  pacienteId: ObjectId (ref: Paciente),
  consultaId: ObjectId (ref: Consulta, opcional),
  nombre: String (requerido),
  descripcion: String,
  piezaDental: String (requerido),
  tipoTratamiento: 'preventivo' | 'restaurativo' | 'endodoncia' | 'periodoncia' | 'ortodoncia' | 'cirugia' | 'protesis' | 'otros',
  estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado',
  costo: Number (requerido, min: 0),
  fechaProgramada: Date,
  fechaInicio: Date,
  fechaCompletado: Date,
  observaciones: String,
  sesiones: [{
    numero: Number,
    fecha: Date,
    descripcion: String,
    costo: Number,
    completada: Boolean
  }],
  materiales: [{
    nombre: String,
    cantidad: Number,
    costoUnitario: Number,
    costoTotal: Number (auto-calculado)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Tabla: Pago
```javascript
{
  _id: ObjectId,
  pacienteId: ObjectId (ref: Paciente, requerido),
  consultaId: ObjectId (ref: Consulta, opcional),
  tratamientoId: ObjectId (ref: Tratamiento, opcional),
  fecha: Date (requerido),
  tipoPago: 'consulta' | 'tratamiento' | 'parcial' | 'total' (requerido),
  concepto: String (requerido),
  monto: Number (requerido, min: 0),
  estado: 'pendiente' | 'pagado' | 'cancelado',
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque',
  observaciones: String,
  tratamientosDetalle: [{
    piezaDental: String,
    tratamiento: String,
    costo: Number,
    pagado: Number
  }],
  montoTotal: Number,      // ✨ NUEVO: Para calcular balance
  montoPagado: Number,     // ✨ NUEVO: Monto ya pagado
  saldoPendiente: Number,  // ✨ NUEVO: Saldo restante
  createdAt: Date,
  updatedAt: Date
}
```

## 💡 Lógica de Negocio Implementada

### 1. Cobro Condicional (Consulta y Pago)

**Regla de Negocio:**
```javascript
// Pseudocódigo
SI paciente tiene tratamientos pendientes de pago:
    NO crear pago de consulta
    // Solo se cobra cuando no hay deuda en tratamientos
SINO SI paciente NO tiene deuda en tratamientos:
    CREAR pago de consulta automáticamente
```

**Implementación Backend (`server/routes/consultaRoutes.js`):**
```javascript
// Al crear una consulta, se verifica si debe cobrar
const tratamientosPendientes = await Tratamiento.find({ 
  pacienteId: value.pacienteId,
  estado: { $in: ['programado', 'en_proceso', 'completado'] }
});

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

// Solo crear pago si NO tiene deuda en tratamientos
if (!tieneDeudaTratamientos && value.costoConsulta > 0) {
  const pagoConsulta = new Pago({
    pacienteId: value.pacienteId,
    consultaId: consulta._id,
    // ... otros campos
  });
  await pagoConsulta.save();
}
```

### 2. Módulo de Consultas

#### 2.1 Guardado de Historial Médico
- **Anamnesis Completa**: Se almacenan síntomas, alergias, medicamentos, antecedentes clínicos, examen físico y plan de tratamiento
- **Consulta No. Automático**: Se numera secuencialmente por paciente
- **Historial Completo**: Todas las consultas quedan registradas con fecha y estado

#### 2.2 Odontograma Dinámico
- **Snapshot del Estado**: Se guarda el estado completo del odontograma en `odontogramaSnapshot`
- **Descripción de Cambios**: Se registra textualmente en `cambiosOdontograma`
- **Versión por Consulta**: Cada consulta puede tener una versión diferente del odontograma

**Endpoints API:**
```javascript
// Guardar odontograma en consulta
POST /api/consultas/:id/guardar-odontograma
Body: { odontogramaSnapshot: {...}, cambiosOdontograma: "..." }

// Obtener odontograma de consulta
GET /api/consultas/:id/odontograma
```

### 3. Módulo de Pagos

#### 3.1 Registro de Deuda
Los pagos muestran claramente qué tratamientos y consultas tienen saldo pendiente.

**Endpoint API:**
```javascript
GET /api/pagos/:pacienteId/deudas
Response: {
  deudas: [
    {
      tipo: 'consulta' | 'tratamiento',
      consultaId?: string,
      tratamientoId?: string,
      descripcion: string,
      montoTotal: number,
      montoPagado: number,
      saldoPendiente: number
    }
  ],
  totalPendiente: number,
  totalDeudas: number
}
```

#### 3.2 Cálculo de Saldo Pendiente

**Pseudocódigo:**
```javascript
PARA CADA consulta:
    totalPagado = SUM(pagos de consulta)
    saldoPendiente = costoTotal + costoConsulta - totalPagado

PARA CADA tratamiento:
    totalPagado = SUM(pagos de tratamiento)
    saldoPendiente = costo - totalPagado

// Mostrar solo deudas con saldo > 0
deudas = filtrar(deudas, d => d.saldoPendiente > 0)
```

#### 3.3 Funcionalidades CRUD de Pagos

**Crear Pago:**
```javascript
POST /api/pagos
Body: {
  pacienteId: string,
  consultaId?: string,
  tratamientoId?: string,
  tipoPago: 'consulta' | 'tratamiento' | 'parcial' | 'total',
  concepto: string,
  monto: number,
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque'
}
```

**Actualizar Pago:**
```javascript
PUT /api/pagos/:id
Body: { ...campos a actualizar }
```

**Eliminar Pago:**
```javascript
DELETE /api/pagos/:id
// Recalcula automáticamente el saldo pendiente
```

**Marcar como Pagado:**
```javascript
PUT /api/pagos/:id/marcar-pagado
// Cambia estado a 'pagado'
```

## 🔌 Endpoints API Nuevos

### Pagos

1. **GET `/api/pagos/:pacienteId/deudas`**
   - Obtiene lista de deudas pendientes
   - Calcula saldos automáticamente
   - Devuelve deudas de consultas y tratamientos

2. **POST `/api/pagos/consultar-cobro`**
   - Verifica si debe cobrar consulta
   - Body: `{ pacienteId, consultaId }`
   - Response: `{ debeCobrarConsulta: boolean, tieneDeudaTratamientos: boolean }`

### Consultas

3. **POST `/api/consultas/:id/guardar-odontograma`**
   - Guarda snapshot del odontograma
   - Body: `{ odontogramaSnapshot, cambiosOdontograma }`

4. **GET `/api/consultas/:id/odontograma`**
   - Obtiene el odontograma de una consulta específica

## 🎨 Componentes Frontend

### ConsultasSection
**Mejoras implementadas:**
- ✅ Campos de anamnesis completa (síntomas, alergias, medicamentos, etc.)
- ✅ Campo para costo de consulta
- ✅ Campo para cambios en odontograma
- ✅ Integración con odontograma snapshot
- ✅ Formulario expandido con todos los campos médicos

### PagosPage
**Mejoras implementadas:**
- ✅ Lista de deudas pendientes destacada
- ✅ Cálculo automático de saldos
- ✅ CRUD completo de pagos (Create, Read, Update, Delete)
- ✅ Estadísticas en tiempo real
- ✅ Modal para crear/editar pagos
- ✅ Botones para marcar como pagado, editar y eliminar

## 📊 Flujos de Trabajo

### 1. Flujo de Consulta
```
1. Usuario crea consulta (con anamnesis, diagnóstico, etc.)
2. Sistema verifica si paciente tiene deuda en tratamientos
3. Si NO tiene deuda → Crea pago de consulta automáticamente
4. Si SÍ tiene deuda → No crea pago (pero guarda la consulta)
5. Guarda snapshot del odontograma si se proporciona
```

### 2. Flujo de Pago
```
1. Usuario busca paciente
2. Sistema muestra deudas pendientes
3. Usuario puede:
   - Crear nuevo pago (total o parcial)
   - Editar pago existente
   - Eliminar pago (recalcula saldo)
   - Marcar como pagado
4. Saldos se actualizan automáticamente
```

## 🧪 Ejemplos de Uso

### Ejemplo 1: Paciente con Deuda
```javascript
// Paciente tiene tratamiento de $500, solo pagó $200
// Saldo pendiente: $300

// Al crear consulta:
POST /api/consultas
{
  pacienteId: "123",
  motivoConsulta: "Revisión",
  costoConsulta: 50
}

// Resultado: NO se crea pago de consulta
// Response: { info: { cobroConsultaAplicado: false } }
```

### Ejemplo 2: Paciente sin Deuda
```javascript
// Paciente NO tiene deuda en tratamientos
// Al crear consulta:
POST /api/consultas
{
  pacienteId: "123",
  motivoConsulta: "Revisión",
  costoConsulta: 50
}

// Resultado: SÍ se crea pago de consulta automáticamente
// Response: { info: { cobroConsultaAplicado: true } }
```

### Ejemplo 3: Ver Deudas
```javascript
// Obtener todas las deudas de un paciente
GET /api/pagos/123/deudas

// Response:
{
  deudas: [
    {
      tipo: "tratamiento",
      nombre: "Endodoncia",
      montoTotal: 500,
      montoPagado: 200,
      saldoPendiente: 300
    },
    {
      tipo: "consulta",
      numeroConsulta: 5,
      montoTotal: 50,
      montoPagado: 0,
      saldoPendiente: 50
    }
  ],
  totalPendiente: 350,
  totalDeudas: 2
}
```

## 🔒 Validaciones y Reglas

1. **Consultas:**
   - No. de consulta se auto-incrementa por paciente
   - costoTotal se calcula automáticamente sumando tratamientos
   - Anamnesis es opcional pero recomendado

2. **Pagos:**
   - Monto debe ser mayor a 0
   - Estado inicial es 'pendiente'
   - Al eliminar pago, se recalcula el saldo del item relacionado

3. **Cobro Condicional:**
   - Solo se cobra consulta si NO hay deuda en tratamientos
   - Se verifica al crear la consulta
   - Se puede crear consulta sin crear pago (siempre que tenga deuda)

## 🚀 Próximos Pasos Recomendados

1. **Integración con Odontograma Visual:**
   - Conectar con componente Odontograma existente
   - Permitir modificación visual y guardar snapshot

2. **Notificaciones:**
   - Alertar al paciente sobre deudas pendientes
   - Recordatorios automáticos

3. **Reportes:**
   - Reporte de ingresos por periodo
   - Reporte de deudas vencidas
   - Estadísticas de pagos por método

4. **Exportación:**
   - Exportar historial de consultas a PDF
   - Exportar reporte de pagos

## 📝 Notas Técnicas

- **Middleware**: Los modelos incluyen middleware para calcular campos automáticamente
- **Índices**: Se han agregado índices para optimizar consultas frecuentes
- **Validación**: Uso de Joi para validación de esquemas en el backend
- **TypeScript**: Tipos definidos en `client/src/types/index.ts`
- **React Query**: Uso de React Query para gestión de estado y caché
- **Notificaciones**: Sistema de notificaciones integrado en frontend

## 🎯 Beneficios de la Implementación

1. **Gestión Financiera Completa**: 
   - Visualización clara de deudas
   - CRUD completo de pagos
   - Cálculos automáticos de saldos

2. **Historial Médico Robusto**:
   - Anamnesis completa almacenada
   - Odontograma versionado por consulta
   - Historial completo accesible

3. **Lógica de Negocio Inteligente**:
   - Cobro condicional automático
   - Prevención de cobros innecesarios
   - Balanceo automático de pagos

4. **UX Mejorada**:
   - Interfaz intuitiva
   - Visualización clara de deudas
   - Operaciones CRUD fluidas





