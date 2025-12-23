# Sistema de Gestión Dental

Sistema completo de gestión odontológica desarrollado por **Nicolás Fernández**.

## 🚀 Despliegue

Para desplegar el sistema en producción, consulta la [Guía de Despliegue](./DEPLOY.md).

### Opciones Recomendadas:
- **Render** (Recomendado para empezar) - Gratis con limitaciones
- **Railway** - Muy fácil de usar
- **Vercel + Render** - Frontend en Vercel, Backend en Render

### Requisitos:
- MongoDB Atlas (base de datos en la nube)
- Node.js 16+ 
- Cuenta en servicio de hosting (Render, Railway, etc.)

Una aplicación web completa para la gestión de consultorios dentales que incluye:

## Funcionalidades Principales

### 1. Gestión de Pacientes (ABM)
- Lista de pacientes con búsqueda y filtrado
- Formulario completo de alta de pacientes
- Anamnesis detallada con campos de estado
- Información personal completa (CI, alergias, edad, etc.)

### 2. Odontograma Interactivo
- Visualización de las 4 secciones de dientes (18-28, 38-48, 55-85)
- Doble capa de información por pieza dental:
  - **Tratamiento Requerido** (Color ROJO)
  - **Tratamiento Existente** (Color AZUL)
- Menú contextual para asignar estados específicos
- Historial visual con fechas de tratamientos

### 3. Gestión de Pagos y Tratamientos
- Historial de pagos con cálculo automático de saldos
- Gestión de estados de facturación (Pendiente/Cancelado)
- Asociación de tratamientos con piezas específicas
- Observaciones detalladas por tratamiento

## Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js**
- **MongoDB** con Mongoose ODM
- API RESTful completa
- Validación de datos con Joi

### Frontend
- **React** con hooks y mejores prácticas
- **CSS-in-JS** para estilos dinámicos
- Componentes reutilizables
- Estado global con Context API

## Instalación y Configuración

1. Instalar dependencias:
```bash
npm run install-all
```

2. Configurar variables de entorno en `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/odontologia
JWT_SECRET=tu_secreto_jwt_aqui
```

3. Ejecutar la aplicación:
```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Estructura del Proyecto

```
odontologia-app/
├── server/                 # Backend Node.js/Express
│   ├── models/            # Modelos de MongoDB
│   ├── routes/            # Rutas de la API
│   ├── middleware/        # Middleware personalizado
│   └── index.js          # Servidor principal
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── context/       # Context API
│   │   └── utils/         # Utilidades
└── README.md
```

## API Endpoints

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `GET /api/pacientes/:id` - Obtener paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente

### Odontograma
- `GET /api/odontograma/:pacienteId` - Obtener odontograma
- `POST /api/odontograma` - Guardar estado del odontograma
- `GET /api/odontograma/:pacienteId/historial` - Historial de tratamientos

### Pagos
- `GET /api/pagos/:pacienteId` - Historial de pagos
- `POST /api/pagos` - Registrar pago
- `POST /api/tratamientos` - Registrar tratamiento

