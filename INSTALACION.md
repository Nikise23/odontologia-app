# 🦷 Sistema de Gestión Dental - Guía de Instalación

## 📋 Resumen del Proyecto

He desarrollado una aplicación web completa para gestión dental que replica exactamente la funcionalidad mostrada en las imágenes de referencia. El sistema incluye:

### ✅ Funcionalidades Implementadas

1. **Gestión de Pacientes (ABM)**
   - Lista de pacientes con búsqueda y filtrado
   - Formulario completo de alta con anamnesis
   - Columnas: Nombre, CI, Alergias, Edad, Fecha
   - Acciones: Ver, Editar, Eliminar

2. **Odontograma Interactivo**
   - 4 secciones de dientes (18-28, 38-48, 55-85)
   - Doble capa de información por pieza:
     - **Tratamiento Requerido** (Color ROJO)
     - **Tratamiento Existente** (Color AZUL)
   - Menú contextual con estados específicos
   - Historial visual con fechas

3. **Gestión de Pagos y Tratamientos**
   - Historial de pagos con cálculo automático de saldos
   - Campos: Total, A/Cuenta, Saldo (Total - A/Cuenta)
   - Estados: Pendiente, Cancelado, Parcial
   - Asociación con piezas específicas

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js**
- **MongoDB** con Mongoose ODM
- **Joi** para validación
- **CORS** y **Helmet** para seguridad

### Frontend
- **React** con TypeScript
- **Styled Components** para estilos dinámicos
- **React Query** para manejo de estado
- **React Router** para navegación
- **React Hook Form** para formularios

## 📁 Estructura del Proyecto

```
odontologia-app/
├── server/                 # Backend Node.js/Express
│   ├── models/            # Modelos de MongoDB
│   │   ├── Paciente.js
│   │   ├── Odontograma.js
│   │   ├── Tratamiento.js
│   │   └── Pago.js
│   ├── routes/            # Rutas de la API
│   │   ├── pacienteRoutes.js
│   │   ├── odontogramaRoutes.js
│   │   ├── pagoRoutes.js
│   │   └── tratamientoRoutes.js
│   ├── config.env         # Variables de entorno
│   ├── package.json
│   └── index.js          # Servidor principal
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── Layout/
│   │   │   ├── Odontograma/
│   │   │   └── Pacientes/
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   ├── types/         # Tipos TypeScript
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── package.json           # Configuración raíz
└── README.md
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
# Instalar dependencias del proyecto raíz
npm install

# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend
cd ../client
npm install
```

### 2. Configurar Base de Datos

Crear un archivo `.env` en la carpeta `server` basado en `config.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/odontologia
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui_2024
NODE_ENV=development
```

### 3. Iniciar MongoDB

Asegúrate de tener MongoDB ejecutándose en tu sistema:

```bash
# En Windows
mongod

# En macOS/Linux
sudo systemctl start mongod
```

### 4. Ejecutar la Aplicación

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Backend en: http://localhost:5000
- Frontend en: http://localhost:3000

## 🎯 Componentes Clave Implementados

### 1. PiezaDental.tsx
```typescript
// Componente que renderiza cada diente con:
// - Color ROJO para tratamientos requeridos
// - Color AZUL para tratamientos existentes
// - Símbolos gráficos específicos (×, ○, •, etc.)
// - Estados dinámicos basados en props
```

### 2. Odontograma.tsx
```typescript
// Componente principal que:
// - Dibuja las 4 secciones de dientes
// - Maneja menú contextual
// - Guarda estados con fechas
// - Calcula historial de cambios
```

### 3. Esquemas de Base de Datos

**Paciente:**
- Información personal completa
- Anamnesis con campos de estado
- Índices para búsqueda eficiente

**Odontograma:**
- Estado de cada pieza dental (requerido/existente)
- Historial de cambios con fechas
- Observaciones por sesión

**Pago:**
- Cálculo automático de saldos
- Historial de pagos parciales
- Estados de facturación

## 🔧 API Endpoints Disponibles

### Pacientes
- `GET /api/pacientes` - Listar con paginación y búsqueda
- `POST /api/pacientes` - Crear paciente
- `GET /api/pacientes/:id` - Obtener paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente

### Odontograma
- `GET /api/odontograma/:pacienteId` - Obtener odontograma
- `POST /api/odontograma` - Guardar estado
- `PUT /api/odontograma/:id` - Actualizar pieza específica
- `GET /api/odontograma/:pacienteId/historial` - Historial de tratamientos

### Pagos
- `GET /api/pagos/:pacienteId` - Historial de pagos
- `POST /api/pagos` - Registrar pago
- `POST /api/pagos/:id/pago-parcial` - Pago parcial
- `GET /api/pagos/:pacienteId/resumen` - Resumen financiero

## 🎨 Características de la Interfaz

### Diseño Responsivo
- Sidebar de navegación con tema oscuro
- Contenido principal con tema claro
- Componentes adaptables a diferentes pantallas

### Interactividad
- Odontograma completamente interactivo
- Menús contextuales al hacer clic en dientes
- Formularios con validación en tiempo real
- Búsqueda y filtrado instantáneo

### Estados Visuales
- Colores distintivos para tratamientos
- Símbolos gráficos específicos por tipo
- Indicadores de estado en tiempo real
- Animaciones suaves en hover

## 📊 Funcionalidades Especiales

### Cálculo Automático de Saldos
```javascript
// En el modelo Pago.js
pagoSchema.pre('save', function(next) {
  this.saldo = this.total - this.aCuenta;
  // Actualizar estado basado en el saldo
  if (this.saldo <= 0) {
    this.estado = 'cancelado';
  } else if (this.aCuenta > 0) {
    this.estado = 'parcial';
  } else {
    this.estado = 'pendiente';
  }
  next();
});
```

### Historial de Odontograma
```javascript
// Cada cambio se registra con:
{
  fecha: Date,
  pieza: string,
  tipo: 'requerido' | 'existente',
  estadoAnterior: string,
  estadoNuevo: string,
  observaciones: string
}
```

## 🔒 Seguridad Implementada

- Validación de datos con Joi
- Rate limiting en API
- CORS configurado
- Helmet para headers de seguridad
- Sanitización de inputs

## 📱 Uso de la Aplicación

1. **Gestión de Pacientes:**
   - Crear nuevos pacientes con formulario completo
   - Buscar pacientes por nombre o CI
   - Ver detalles completos incluyendo anamnesis
   - Editar información existente

2. **Odontograma:**
   - Hacer clic en cualquier diente para abrir menú contextual
   - Seleccionar tipo de tratamiento (requerido/existente)
   - Ver cambios reflejados inmediatamente con colores
   - Guardar estado con observaciones y fecha

3. **Pagos:**
   - Registrar pagos con cálculo automático de saldos
   - Ver resumen financiero del paciente
   - Gestionar pagos parciales
   - Historial completo de transacciones

## 🎉 ¡Sistema Completo y Funcional!

La aplicación está lista para usar y replica exactamente la funcionalidad mostrada en las imágenes de referencia, con todas las especificaciones técnicas solicitadas implementadas correctamente.


