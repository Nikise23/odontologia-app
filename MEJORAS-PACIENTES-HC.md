# Propuesta de Mejoras: Historia Clínica Integral

## 📋 Objetivo

Integrar en un único módulo todos los componentes de la historia clínica del paciente:
- Odontograma con histórico
- Consultas con odontograma snapshot
- Tratamientos realizados
- Historial financiero y pagos (secretaría)
- Anamnesis y antecedentes médicos

---

## 🏗️ Estructura Mejorada de Paciente

### 1. Modelo de Historia Clínica

```javascript
// server/models/HistoriaClinica.js
const mongoose = require('mongoose');

const historiaClinicaSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  numeroHistorial: {
    type: Number,
    unique: true,
    required: true
  },
  
  // ===== INFORMACIÓN PERSONAL =====
  datosPersonales: {
    nombre: String,
    ci: String,
    fechaNacimiento: Date,
    edad: Number,
    genero: String,
    telefono: String,
    email: String,
    direccion: String,
    ocupacion: String,
    estadoCivil: String
  },
  
  // ===== ANAMNESIS Y ANTECEDENTES =====
  anamnesis: {
    alergias: String,
    diabetes: Boolean,
    hipertension: Boolean,
    cardiopatia: Boolean,
    embarazo: Boolean,
    medicamentos: String,
    antecedentesFamiliares: String,
    observacionesMedicas: String,
    fechaActualizacion: Date
  },
  
  // ===== ODONTOGRAMA =====
  odontogramaActual: {
    fechaRegistro: Date,
    piezas: {
      type: Map,
      of: {
        requerido: String,  // Caries, Obturado, etc.
        existente: String,
        tratamientos: [{
          fecha: Date,
          tipo: String,
          observaciones: String
        }]
      }
    }
  },
  
  historialOdontograma: [{
    fecha: Date,
    pieza: String,
    tipo: String, // 'requerido' | 'existente'
    estadoAnterior: String,
    estadoNuevo: String,
    consultaId: String,
    observaciones: String
  }],
  
  // ===== CONSULTAS =====
  consultas: [{
    consultaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consulta'
    },
    numeroConsulta: Number,
    fecha: Date,
    motivo: String,
    diagnostico: String,
    odontogramaSnapshot: Object, // Snapshot del odontograma en ese momento
    tratamientos: [{
      piezaDental: String,
      tratamiento: String,
      costo: Number
    }],
    costoTotal: Number
  }],
  
  // ===== TRATAMIENTOS =====
  tratamientos: [{
    tratamientoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tratamiento'
    },
    nombre: String,
    piezaDental: String,
    tipo: String,
    estado: String,
    fechaProgramada: Date,
    fechaInicio: Date,
    fechaCompletado: Date,
    costo: Number,
    sesiones: Number,
    sesionesCompletadas: Number
  }],
  
  // ===== INFORMACIÓN FINANCIERA =====
  // Secretaría gestiona esta sección
  historialFinanciero: {
    totalConsultas: Number,
    totalTratamientos: Number,
    totalPagado: Number,
    totalPendiente: Number,
    ultimaActualizacion: Date
  },
  
  pagos: [{
    pagoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pago'
    },
    fecha: Date,
    tipo: String, // 'consulta' | 'tratamiento' | 'parcial'
    concepto: String,
    monto: Number,
    metodoPago: String,
    estado: String
  }],
  
  // ===== METADATOS =====
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  fechaUltimaActualizacion: Date,
  activo: {
    type: Boolean,
    default: true
  },
  notasAdministrativas: [{
    fecha: Date,
    autor: String,
    rol: String,
    contenido: String
  }]
}, {
  timestamps: true
});

// Middleware para actualizar fecha de modificación
historiaClinicaSchema.pre('save', function(next) {
  this.fechaUltimaActualizacion = new Date();
  next();
});

// Índices para búsqueda
historiaClinicaSchema.index({ pacienteId: 1 });
historiaClinicaSchema.index({ numeroHistorial: 1 });
historiaClinicaSchema.index({ 'consultas.fecha': -1 });
historiaClinicaSchema.index({ 'tratamientos.fechaInicio': -1 });

module.exports = mongoose.model('HistoriaClinica', historiaClinicaSchema);
```

---

## 🔄 Relaciones y Flujo de Datos

### Flujo 1: Nueva Consulta

```
1. Dentista crea consulta → Guarda en Modelo Consulta
2. Se toma snapshot del odontograma actual → Guarda en consulta.odontogramaSnapshot
3. Se actualiza HistoriaClinica:
   - Agrega consulta a consultas[]
   - Actualiza historialOdontograma[]
   - Guarda snapshots de piezas dentales afectadas
```

### Flujo 2: Tratamiento Completo

```
1. Dentista crea/actualiza tratamiento
2. Se vincula con HistoriaClinica
3. Se actualiza estado en tratamientos[]
4. Si afecta pieza dental → actualiza odontogramaActual
```

### Flujo 3: Pago (Secretaría)

```
1. Secretaría registra pago → Modelo Pago
2. Se actualiza HistoriaClinica:
   - Agrega pago a pagos[]
   - Actualiza historialFinanciero
   - Calcula totalPagado y totalPendiente
```

---

## 🎨 Componente Frontend: Historia Clínica Completa

```typescript
// client/src/pages/HistoriaClinicaPage.tsx

interface HistoriaClinicaData {
  datosPersonales: DatosPersonales;
  anamnesis: Anamnesis;
  odontogramaActual: Odontograma;
  consultas: Consulta[];
  tratamientos: Tratamiento[];
  historialFinanciero: ResumenFinanciero;
  pagos: Pago[];
}

const HistoriaClinicaPage = () => {
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaClinicaData>();
  const [seccionActiva, setSeccionActiva] = useState<'odontograma' | 'consultas' | 'tratamientos' | 'financiero'>('odontograma');
  const { usuario } = useAuth();
  const esSecretaria = usuario?.rol === 'secretaria';
  
  return (
    <Container>
      <Header>
        <Title>Historia Clínica - {historiaClinica?.datosPersonales.nombre}</Title>
        <InfoBadge>Historial #{historiaClinica?.numeroHistorial}</InfoBadge>
      </Header>
      
      {/* Navegación por secciones */}
      <Tabs>
        <Tab $active={seccionActiva === 'odontograma'} onClick={() => setSeccionActiva('odontograma')}>
          Odontograma
        </Tab>
        <Tab $active={seccionActiva === 'consultas'} onClick={() => setSeccionActiva('consultas')}>
          Consultas
        </Tab>
        <Tab $active={seccionActiva === 'tratamientos'} onClick={() => setSeccionActiva('tratamientos')}>
          Tratamientos
        </Tab>
        {esSecretaria && (
          <Tab $active={seccionActiva === 'financiero'} onClick={() => setSeccionActiva('financiero')}>
            Pagos
          </Tab>
        )}
      </Tabs>
      
      {/* Contenido según sección */}
      <Content>
        {seccionActiva === 'odontograma' && (
          <OdontogramaSection 
            pacienteId={pacienteId}
            odontograma={historiaClinica?.odontogramaActual}
            historial={historiaClinica?.historialOdontograma}
          />
        )}
        
        {seccionActiva === 'consultas' && (
          <ConsultasSection
            consultas={historiaClinica?.consultas}
            onNuevaConsulta={handleNuevaConsulta}
          />
        )}
        
        {seccionActiva === 'tratamientos' && (
          <TratamientosSection
            tratamientos={historiaClinica?.tratamientos}
            onNuevoTratamiento={handleNuevoTratamiento}
          />
        )}
        
        {seccionActiva === 'financiero' && esSecretaria && (
          <FinancieroSection
            historialFinanciero={historiaClinica?.historialFinanciero}
            pagos={historiaClinica?.pagos}
            onNuevoPago={handleNuevoPago}
          />
        )}
      </Content>
    </Container>
  );
};
```

---

## 📊 Vista: Sección de Odontograma Mejorado

```typescript
// client/src/components/Odontograma/OdontogramaMejorado.tsx

interface OdontogramaMejoradoProps {
  odontogramaActual: Odontograma;
  historial: HistorialCambios[];
  consultas: Consulta[]; // Para ver snapshots históricos
}

const OdontogramaMejorado = ({ odontogramaActual, historial, consultas }) => {
  const [vista, setVista] = useState<'actual' | 'historico'>('actual');
  const [consultaSeleccionada, setConsultaSeleccionada] = useState<string>();
  
  return (
    <Grid>
      {/* Visualización del Odontograma */}
      <OdontogramaVisual
        data={vista === 'actual' ? odontogramaActual : getSnapshot(consultaSeleccionada)}
        editable={true}
        onPiezaClick={handlePiezaClick}
      />
      
      {/* Panel lateral: Timeline de cambios */}
      <PanelHistorico>
        <Titulo>Historial de Cambios</Titulo>
        
        {/* Timeline de Consultas */}
        {consultas.map(consulta => (
          <ItemHistorico key={consulta._id}>
            <Fecha>Consulta #{consulta.numeroConsulta}</Fecha>
            <Fecha>{new Date(consulta.fecha).toLocaleDateString()}</Fecha>
            <Button onClick={() => verSnapshotConsulta(consulta._id)}>
              Ver Estado
            </Button>
          </ItemHistorico>
        ))}
      </PanelHistorico>
      
      {/* Detalle de pieza dental */}
      {piezaSeleccionada && (
        <ModalDetallePieza
          pieza={piezaSeleccionada}
          historial={historial.filter(h => h.pieza === piezaSeleccionada)}
          tratamientos={obtenerTratamientosPieza(piezaSeleccionada)}
        />
      )}
    </Grid>
  );
};
```

---

## 💰 Sección Financiera (Secretaría)

```typescript
// client/src/components/Pagos/FinancieroSection.tsx

const FinancieroSection = ({ historialFinanciero, pagos, onNuevoPago }) => {
  const esSecretaria = useAuth().usuario?.rol === 'secretaria';
  
  return (
    <Container>
      {/* Resumen Financiero */}
      <ResumenGrid>
        <Card>
          <Valor>${historialFinanciero.totalConsultas}</Valor>
          <Label>Total Consultas</Label>
        </Card>
        <Card>
          <Valor>${historialFinanciero.totalTratamientos}</Valor>
          <Label>Total Tratamientos</Label>
        </Card>
        <Card $positive>
          <Valor>${historialFinanciero.totalPagado}</Valor>
          <Label>Total Pagado</Label>
        </Card>
        <Card $negative>
          <Valor>${historialFinanciero.totalPendiente}</Valor>
          <Label>Pendiente</Label>
        </Card>
      </ResumenGrid>
      
      {/* Acción: Nuevo Pago (solo secretaría) */}
      {esSecretaria && (
        <Button onClick={onNuevoPago}>
          <FaPlus /> Registrar Pago
        </Button>
      )}
      
      {/* Lista de Pagos */}
      <TablaPagos>
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
                  <Button variant="small">Ver</Button>
                  <Button variant="small">Imprimir</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </TablaPagos>
    </Container>
  );
};
```

---

## 🔐 API Endpoints Necesarios

```javascript
// server/routes/historiaClinicaRoutes.js

// Obtener historia clínica completa
GET /api/historia-clinica/:pacienteId
- Devuelve: HistoriaClinica completa
- Roles: dentista, secretaría

// Actualizar anamnesis
PUT /api/historia-clinica/:pacienteId/anamnesis
- Body: datos de anamnesis
- Roles: dentista

// Obtener snapshot de odontograma en consulta específica
GET /api/historia-clinica/:pacienteId/consultas/:consultaId/odontograma
- Devuelve: snapshot del odontograma
- Roles: dentista, secretaría

// Listar pagos del paciente
GET /api/historia-clinica/:pacienteId/pagos
- Query params: ?startDate= &endDate=
- Roles: dentista, secretaría (pueden ver todos)
              paciente (solo propios)

// Registrar nuevo pago (secretaría)
POST /api/historia-clinica/:pacienteId/pagos
- Body: datos del pago
- Roles: dentista, secretaría

// Reportes financieros
GET /api/historia-clinica/:pacienteId/reporte-financiero
- Devuelve: resumen financiero detallado
- Roles: dentista, secretaría
```

---

## 📈 Ventajas de esta Estructura

### 1. **Centralización**
- Todos los datos del paciente en un solo lugar
- Consulta rápida y eficiente
- Fácil de exportar

### 2. **Histórico Completo**
- Odontograma con timeline visual
- Snapshots en cada consulta
- Trazabilidad completa

### 3. **Roles Claros**
- Dentista: Gestiona datos clínicos
- Secretaría: Gestiona finanzas
- Paciente: Visualiza su historia

### 4. **Escalabilidad**
- Estructura modular
- Fácil agregar nuevos campos
- Preparada para futuras funcionalidades

---

## 🚀 Plan de Implementación

### Fase 1: Backend (Semana 1)
- [ ] Crear modelo HistoriaClinica
- [ ] Migrar datos existentes
- [ ] Crear API endpoints
- [ ] Middleware de permisos

### Fase 2: Frontend - Odontograma (Semana 2)
- [ ] Componente OdontogramaMejorado
- [ ] Timeline de cambios
- [ ] Visualización de snapshots
- [ ] Integración con consultas

### Fase 3: Frontend - Finanzas (Semana 3)
- [ ] Dashboard financiero
- [ ] Gestión de pagos (secretaría)
- [ ] Reportes y gráficos
- [ ] Impresión de comprobantes

### Fase 4: Testing y Optimización (Semana 4)
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Optimización de rendimiento
- [ ] Documentación

---

## 💡 Funcionalidades Adicionales Sugeridas

### 1. Exportación de HC
```javascript
// Exportar historia clínica completa a PDF
GET /api/historia-clinica/:pacienteId/export-pdf
```

### 2. Backup Automático
```javascript
// Sistema de backups incrementales
- Diario automático
- Antes de cambios importantes
- Retención configurable
```

### 3. Notificaciones
```javascript
// Alertas automáticas
- Pago vencido
- Tratamiento por completar
- Recordatorio de próxima cita
```

---

## 🎯 Resultados Esperados

- ✅ Historia clínica digitalizada e integrada
- ✅ Mejor trazabilidad de tratamientos
- ✅ Gestión eficiente de pagos (secretaría)
- ✅ Odontograma con histórico visual
- ✅ Dashboard financiero completo
- ✅ Sistema escalable y modular



