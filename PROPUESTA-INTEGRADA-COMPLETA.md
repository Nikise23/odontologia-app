# Propuesta Integrada: Sistema de Roles + Historia Clínica + Gestión de Pagos

## 🎯 Resumen Ejecutivo

Integración completa del sistema con:
- ✅ Sistema de autenticación y roles (Dentista, Secretaría, Paciente)
- ✅ Historia clínica centralizada
- ✅ Gestión completa de pagos (crear, modificar, eliminar)
- ✅ Odontograma con histórico
- ✅ Dashboard por rol

---

## 🔐 Sistema de Roles Integrado

### Matriz de Permisos para Pagos

| Acción sobre Pagos | Dentista | Secretaría | Paciente |
|---------------------|----------|------------|----------|
| Ver todos los pagos | ✅ | ✅ | ❌ |
| Ver pagos propios | ✅ | ✅ | ✅ |
| Crear pagos | ✅ | ✅ | ❌ |
| Modificar pagos | ✅ | ✅ | ❌ |
| Eliminar pagos | ✅ | ✅ (con límites) | ❌ |
| Reimprimir comprobantes | ✅ | ✅ | ✅ (solo propios) |
| Exportar reportes | ✅ | ✅ | ❌ |

---

## 💰 Funcionalidades Completas de Pagos

### 1. Crear Pago

```javascript
// server/routes/pagoRoutes.js
const { verificarAuth, verificarRol } = require('../middleware/permisos');

router.post('/', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  const { pacienteId, consultaId, tratamientoId, tipoPago, concepto, monto, metodoPago } = req.body;
  
  // Validar que no se exceda el monto pendiente
  const deudas = await calcularDeudasPendientes(pacienteId);
  const montoTotal = calcularTotalDeudas(deudas);
  
  if (monto > montoTotal) {
    return res.status(400).json({
      success: false,
      message: 'El monto excede las deudas pendientes'
    });
  }
  
  const pago = await Pago.create({
    ...req.body,
    usuarioCreador: req.usuario.id,
    rolCreador: req.usuario.rol,
    fecha: new Date(),
    estado: 'pagado'
  });
  
  // Actualizar deudas relacionadas
  await actualizarDeudasRelacionadas(pago);
  
  res.json({ success: true, data: pago });
});
```

### 2. Modificar Pago

```javascript
router.put('/:pagoId', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  const pago = await Pago.findById(req.params.pagoId);
  
  if (!pago) {
    return res.status(404).json({ success: false, message: 'Pago no encontrado' });
  }
  
  // Solo permitir modificar pagos recientes (menos de 24 horas)
  const horasDesdeCreacion = (new Date() - pago.createdAt) / (1000 * 60 * 60);
  
  if (horasDesdeCreacion > 24) {
    return res.status(403).json({
      success: false,
      message: 'Solo se pueden modificar pagos con menos de 24 horas de antigüedad'
    });
  }
  
  // Guardar histórico antes de modificar
  await HistorialPago.create({
    pagoId: pago._id,
    accion: 'modificado',
    usuarioId: req.usuario.id,
    datosAnteriores: pago.toObject(),
    datosNuevos: req.body,
    fecha: new Date()
  });
  
  Object.assign(pago, req.body);
  pago.ultimaModificacion = new Date();
  pago.usuarioModificador = req.usuario.id;
  
  await pago.save();
  
  res.json({ success: true, data: pago });
});
```

### 3. Eliminar Pago

```javascript
router.delete('/:pagoId', verificarAuth, verificarRol('dentista', 'secretaria'), async (req, res) => {
  const pago = await Pago.findById(req.params.pagoId);
  
  if (!pago) {
    return res.status(404).json({ success: false, message: 'Pago no encontrado' });
  }
  
  // Validaciones antes de eliminar
  const horasDesdeCreacion = (new Date() - pago.createdAt) / (1000 * 60 * 60);
  
  // Solo secretaría puede eliminar, con límites más estrictos
  if (req.usuario.rol === 'secretaria' && horasDesdeCreacion > 1) {
    return res.status(403).json({
      success: false,
      message: 'Solo se pueden eliminar pagos con menos de 1 hora de antigüedad'
    });
  }
  
  // Guardar en histórico antes de eliminar
  await HistorialPago.create({
    pagoId: pago._id,
    accion: 'eliminado',
    usuarioId: req.usuario.id,
    datosAnteriores: pago.toObject(),
    razon: req.body.razon || 'No especificada',
    fecha: new Date()
  });
  
  // Revertir deudas
  await revertirDeudasRelacionadas(pago);
  
  await pago.deleteOne();
  
  res.json({ success: true, message: 'Pago eliminado correctamente' });
});
```

---

## 📋 Modelo de Historial de Pagos

```javascript
// server/models/HistorialPago.js
const mongoose = require('mongoose');

const historialPagoSchema = new mongoose.Schema({
  pagoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago',
    required: true
  },
  accion: {
    type: String,
    enum: ['creado', 'modificado', 'eliminado'],
    required: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  rol: String,
  datosAnteriores: Object,
  datosNuevos: Object,
  razon: String,
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HistorialPago', historialPagoSchema);
```

---

## 🎨 Componente Frontend: Gestión de Pagos (Secretaría)

```typescript
// client/src/components/Pagos/GestionPagos.tsx

interface GestionPagosProps {
  pacienteId: string;
  esSecretaria: boolean;
}

const GestionPagos = ({ pacienteId, esSecretaria }: GestionPagosProps) => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);
  const [accion, setAccion] = useState<'crear' | 'editar' | 'eliminar' | null>(null);
  
  // Eliminar pago
  const handleEliminar = async (pago: Pago) => {
    if (!window.confirm(`¿Está seguro de eliminar el pago de $${pago.monto}?`)) {
      return;
    }
    
    const razon = prompt('Ingrese la razón de la eliminación:');
    if (!razon) return;
    
    try {
      await eliminarPago(pago._id, { razon });
      showNotification('Pago eliminado correctamente', 'success');
      await refetchPagos();
    } catch (error) {
      showNotification('Error al eliminar el pago', 'error');
    }
  };
  
  // Modificar pago
  const handleModificar = (pago: Pago) => {
    setPagoSeleccionado(pago);
    setAccion('editar');
  };
  
  return (
    <Container>
      <Header>
        <Title>Gestión de Pagos</Title>
        {esSecretaria && (
          <Button onClick={() => setAccion('crear')}>
            <FaPlus /> Nuevo Pago
          </Button>
        )}
      </Header>
      
      {/* Tabla de pagos */}
      <Tabla>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Estado</th>
            {esSecretaria && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {pagos.map(pago => (
            <tr key={pago._id}>
              <td>{new Date(pago.fecha).toLocaleDateString()}</td>
              <td>{pago.concepto}</td>
              <td>${pago.monto.toLocaleString()}</td>
              <td>{pago.metodoPago}</td>
              <td><Badge estado={pago.estado}>{pago.estado}</Badge></td>
              
              {esSecretaria && (
                <td>
                  <Acciones>
                    <IconButton onClick={() => handleModificar(pago)} title="Editar">
                      <FaEdit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleEliminar(pago)}
                      disabled={!puedeEliminar(pago)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </IconButton>
                    <IconButton onClick={() => imprimirComprobante(pago)} title="Imprimir">
                      <FaPrint />
                    </IconButton>
                  </Acciones>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Tabla>
      
      {/* Badge de advertencia para pagos antiguos */}
      {pagos.map(pago => {
        const horasDesdeCreacion = calcularHoras(pago.createdAt);
        return horasDesdeCreacion > 1 && (
          <Tooltip key={pago._id}>
            <Info>Este pago tiene más de 1 hora, no se puede eliminar</Info>
          </Tooltip>
        );
      })}
    </Container>
  );
};

// Función auxiliar para determinar si se puede eliminar
const puedeEliminar = (pago: Pago): boolean => {
  const horasDesdeCreacion = (new Date().getTime() - new Date(pago.createdAt).getTime()) / (1000 * 60 * 60);
  return horasDesdeCreacion <= 1;
};
```

---

## 🔄 Flujo Completo Integrado

### 1. Login y Detección de Rol

```typescript
// client/src/pages/LoginPage.tsx
const LoginPage = () => {
  const { login, usuario } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    
    // Redirigir según rol
    if (usuario?.rol === 'dentista') {
      navigate('/dashboard/dentista');
    } else if (usuario?.rol === 'secretaria') {
      navigate('/dashboard/secretaria');
    } else if (usuario?.rol === 'paciente') {
      navigate('/dashboard/paciente');
    }
  };
  
  return (/* UI del login */);
};
```

### 2. Dashboard por Rol

```typescript
// Dentista: Acceso completo
const DashboardDentista = () => (
  <>
    <PacientesSection />
    <CitasSection />
    <ConsultasSection />
    <TratamientosSection />
    <OdontogramaSection />
    <PagosSection editable={true} />
  </>
);

// Secretaría: Citas y Pagos
const DashboardSecretaria = () => (
  <>
    <CitasSection editable={true} />
    <PacientesSection soloLectura={true} />
    <PagosSection editable={true} />
    <HistorialPagosSection />
  </>
);

// Paciente: Solo lectura
const DashboardPaciente = () => (
  <>
    <MiHistorial />
    <MisCitas />
    <MisPagos />
    <MiOdontograma />
  </>
);
```

### 3. Historia Clínica Integrada

```typescript
// client/src/pages/HistoriaClinicaPage.tsx
const HistoriaClinicaPage = ({ pacienteId }) => {
  const { usuario } = useAuth();
  const esDentista = usuario?.rol === 'dentista';
  const esSecretaria = usuario?.rol === 'secretaria';
  
  return (
    <Layout>
      {/* Información General */}
      <SeccionDatosPersonales pacienteId={pacienteId} />
      
      {/* Odontograma con histórico */}
      <SeccionOdontograma 
        pacienteId={pacienteId}
        puedeEditar={esDentista}
        mostrarHistorial={true}
      />
      
      {/* Consultas */}
      <SeccionConsultas 
        pacienteId={pacienteId}
        puedeCrearEditar={esDentista}
      />
      
      {/* Tratamientos */}
      <SeccionTratamientos 
        pacienteId={pacienteId}
        puedeCrearEditar={esDentista}
      />
      
      {/* Pagos - Secretaría puede gestionar */}
      <SeccionPagos 
        pacienteId={pacienteId}
        puedeGestionar={esDentista || esSecretaria}
        puedeEditar={esDentista || esSecretaria}
        puedeEliminar={esDentista || esSecretaria}
      />
    </Layout>
  );
};
```

---

## 🛡️ Validaciones de Seguridad para Pagos

### Reglas de Eliminación

```javascript
// Solo en estas condiciones se puede eliminar un pago:
1. Dentista: Puede eliminar a cualquier hora
2. Secretaría: Solo puede eliminar si:
   - Pago tiene menos de 1 hora de antigüedad
   - Está en estado 'pendiente'
   - No está vinculado a un pago procesado externamente
   
3. Nunca se puede eliminar:
   - Pagos de hace más de 30 días
   - Pagos que ya generaron comprobantes fiscales
   - Pagos que afectaron reportes oficiales
```

### Log de Auditoría

```javascript
// Toda acción sobre pagos se registra automáticamente
{
  accion: 'eliminado',
  usuario: 'secretaria@clinica.com',
  rol: 'secretaria',
  pagoId: '...',
  monto: 150.00,
  concepto: 'Consulta #5',
  razon: 'Error en el monto',
  fechaHora: '2024-10-29T10:30:00Z',
  ip: '192.168.1.100'
}
```

---

## 📊 Dashboard Financiero (Secretaría)

```typescript
const DashboardFinanciero = () => {
  const [resumen, setResumen] = useState({
    totalHoy: 0,
    totalSemana: 0,
    totalMes: 0,
    pagosPendientes: 0,
    topPacientes: [],
    metodosPago: []
  });
  
  return (
    <Container>
      <Titulo>Panel Financiero</Titulo>
      
      {/* Resumen rápido */}
      <ResumenGrid>
        <Card $highlight>
          <Valor>${resumen.totalHoy}</Valor>
          <Label>Hoy</Label>
        </Card>
        <Card>
          <Valor>${resumen.totalSemana}</Valor>
          <Label>Esta Semana</Label>
        </Card>
        <Card>
          <Valor>${resumen.totalMes}</Valor>
          <Label>Este Mes</Label>
        </Card>
        <Card $warning>
          <Valor>{resumen.pagosPendientes}</Valor>
          <Label>Pendientes</Label>
        </Card>
      </ResumenGrid>
      
      {/* Gráficos */}
      <Grid>
        <GraficoBarras data={resumen.metodosPago} titulo="Métodos de Pago" />
        <GraficoTorta data={resumen.topPacientes} titulo="Top 5 Pacientes" />
      </Grid>
      
      {/* Acciones rápidas */}
      <AccionesRapidas>
        <Button onClick={abrirModalPago}>Registrar Pago</Button>
        <Button onClick={exportarReporte}>Exportar Reporte</Button>
        <Button onClick={imprimirReporte}>Imprimir Reporte</Button>
      </AccionesRapidas>
    </Container>
  );
};
```

---

## 🔗 Endpoints Completos de Pagos

```javascript
// server/routes/pagoRoutes.js

// Crear
POST /api/pagos
- Body: { pacienteId, tipoPago, concepto, monto, metodoPago, ... }
- Roles: dentista, secretaria

// Listar todos (con filtros)
GET /api/pagos?pacienteId=...&startDate=...&endDate=...&estado=...
- Roles: dentista, secretaria (ver todos)
              paciente (solo propios)

// Obtener uno
GET /api/pagos/:pagoId
- Roles: dentista, secretaria, paciente (si es propio)

// Modificar
PUT /api/pagos/:pagoId
- Body: { monto, concepto, metodoPago, ... }
- Validaciones: menos de 24 horas
- Roles: dentista, secretaria

// Eliminar
DELETE /api/pagos/:pagoId
- Body: { razon: string }
- Validaciones: menos de 1 hora (secretaria), sin límite (dentista)
- Roles: dentista, secretaria

// Historial de cambios
GET /api/pagos/:pagoId/historial
- Roles: dentista, secretaria

// Reimprimir comprobante
POST /api/pagos/:pagoId/reimprimir
- Roles: dentista, secretaria, paciente (solo propio)

// Reportes
GET /api/pagos/reporte?fechaDesde=...&fechaHasta=...
- Roles: dentista, secretaria
```

---

## ✅ Resumen de Funcionalidades

### ✅ Incluye Todo:

1. **Sistema de Roles**
   - Autenticación JWT
   - Permisos por rol
   - Protección de rutas

2. **Historia Clínica Integrada**
   - Odontograma con histórico
   - Consultas con snapshots
   - Tratamientos completos

3. **Gestión de Pagos Completa**
   - ✅ Crear pagos
   - ✅ Modificar pagos (dentro de 24h)
   - ✅ Eliminar pagos (dentro de 1h para secretaría)
   - ✅ Historial de cambios
   - ✅ Comprobantes
   - ✅ Reportes financieros

4. **Dashboard por Rol**
   - Dentista: Acceso completo
   - Secretaría: Citas y Pagos
   - Paciente: Solo visualización

5. **Seguridad**
   - Validaciones de tiempo
   - Log de auditoría
   - Protección contra eliminaciones

---

## 🚀 Plan de Implementación

### Semana 1: Backend - Roles y Pagos
- [ ] Modelo Usuario
- [ ] Autenticación JWT
- [ ] Endpoints de pagos (CRUD completo)
- [ ] Middleware de permisos

### Semana 2: Backend - Historia Clínica
- [ ] Modelo HistoriaClinica
- [ ] Integración con odontograma
- [ ] Migración de datos

### Semana 3: Frontend - Autenticación y UI
- [ ] Login
- [ ] Dashboards por rol
- [ ] Context de autenticación

### Semana 4: Frontend - Gestión de Pagos
- [ ] Componente crear/editar pagos
- [ ] Eliminar con validaciones
- [ ] Dashboard financiero

### Semana 5: Testing y Optimización
- [ ] Tests
- [ ] Performance
- [ ] Documentación

---

¿Quieres que implemente esto ahora?



