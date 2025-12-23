# Guía de Despliegue - Sistema Odontológico

## Opción 1: Render (Recomendado)

### ⚠️ Importante: Planes de Render y MongoDB

**Planes de Render:**
- **Gratis**: Web Services y Static Sites (con limitaciones)
- **Starter ($7/mes)**: Private Services y Discos Persistentes

**⚠️ MongoDB en Render requiere plan de pago:**
- Los **Private Services** (necesarios para MongoDB) requieren plan **Starter** ($7/mes)
- Los **Discos Persistentes** también requieren plan de pago
- **NO puedes desplegar MongoDB en Render con el plan gratuito**

**Opciones para MongoDB:**
1. **MongoDB Atlas** (Gratis hasta 512MB) ✅ **ÚNICA OPCIÓN GRATIS**
2. **MongoDB en Render con disco persistente** (Requiere Starter $7/mes + disco) ⚙️
3. **Railway** (tiene MongoDB como servicio nativo, $5 créditos gratis/mes) ✅
4. **MongoDB en un VPS separado** (más complejo)

### ✅ Opción Gratis: Backend + Frontend en Render + MongoDB Atlas

**Puedes desplegar TODO gratis usando:**
- Backend: Render (plan gratuito)
- Frontend: Render Static Site (gratis)
- MongoDB: Atlas (gratis hasta 512MB)

**NO necesitas pagar nada para empezar.**

### Prerequisitos
- Cuenta en [Render](https://render.com) - **Gratis**
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - **Gratis**
- Repositorio en GitHub

### Paso 1: Configurar MongoDB Atlas

1. Crea una cuenta en MongoDB Atlas
2. Crea un nuevo cluster (gratis)
3. Crea un usuario de base de datos
4. Obtén la connection string (ejemplo: `mongodb+srv://usuario:password@cluster.mongodb.net/odontologia?retryWrites=true&w=majority`)

### Paso 2: Desplegar Backend en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `odontologia-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: (dejar vacío)

5. Variables de Entorno:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/odontologia
   JWT_SECRET=tu-secret-key-super-segura-generar-una-aleatoria
   PORT=5000
   ```

6. Click en "Create Web Service"

### Paso 3: Desplegar Frontend en Render

1. Click en "New +" → "Static Site"
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name**: `odontologia-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`

4. Variables de Entorno:
   ```
   REACT_APP_API_URL=https://odontologia-backend.onrender.com/api
   ```

5. Click en "Create Static Site"

### Paso 4: Actualizar CORS en Backend

En `server/index.js`, actualiza la configuración de CORS:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://odontologia-frontend.onrender.com'] // URL de tu frontend
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Paso 5: Crear Usuario Admin

Una vez desplegado, ejecuta el script para crear el admin:

```bash
# En tu máquina local, conectado a la base de datos de producción
cd server
MONGODB_URI=tu-uri-de-produccion npm run crear-admin
```

O crea el admin desde la interfaz web una vez que tengas acceso.

### Alternativa: MongoDB en Render con Disco Persistente (Requiere Pago)

⚠️ **IMPORTANTE**: Esta opción requiere:
- Plan **Starter** de Render: $7/mes
- Disco persistente: ~$1.25/mes (5GB)
- **Total: ~$8-10/mes mínimo**

Si prefieres NO usar MongoDB Atlas y tener MongoDB directamente en Render:

#### Paso 1: Crear Servicio MongoDB en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" → "Private Service"
3. Configuración:
   - **Name**: `odontologia-mongodb`
   - **Environment**: `Docker`
   - **Docker Image**: `mongo:7.0` (o la versión más reciente)
   - **Region**: Elige la región más cercana

4. **Variables de Entorno:**
   ```
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=tu-password-super-seguro-aqui
   MONGO_INITDB_DATABASE=odontologia
   ```

5. **Puerto**: `27017`

6. **Disco Persistente** (IMPORTANTE):
   - Click en "Add Disk"
   - **Name**: `mongodb-data`
   - **Size**: Mínimo 1GB (recomendado 5GB para empezar)
   - **Mount Path**: `/data/db` (esta es la ruta donde MongoDB guarda los datos)

7. Click en "Create Private Service"

#### Paso 2: Obtener la URL de Conexión

Una vez creado el servicio MongoDB:

1. Ve a la página del servicio MongoDB
2. En la sección "Info", encontrarás:
   - **Internal URL**: `mongodb://admin:password@odontologia-mongodb:27017`
   - **External URL**: (si Render la proporciona)

3. **Para servicios en el mismo proyecto Render**, usa la **Internal URL**:
   ```
   mongodb://admin:tu-password@odontologia-mongodb:27017/odontologia?authSource=admin
   ```

#### Paso 3: Conectar el Backend al MongoDB

1. En tu servicio Backend (odontologia-backend)
2. Ve a "Environment"
3. Agrega la variable:
   ```
   MONGODB_URI=mongodb://admin:tu-password@odontologia-mongodb:27017/odontologia?authSource=admin
   ```
   ⚠️ **Importante**: Reemplaza `tu-password` con el password que configuraste en el paso 1

4. Si ambos servicios están en el mismo proyecto, Render los conecta automáticamente por la red interna.

#### Paso 4: Configurar Acceso Externo (Opcional)

Si necesitas acceder desde fuera de Render:

1. En el servicio MongoDB, habilita "Public Networking" (si está disponible)
2. Obtén la URL externa
3. Actualiza `MONGODB_URI` con la URL externa

#### Costos Aproximados

- **Servicio Privado**: Desde $7/mes (plan Starter)
- **Disco Persistente**: 
  - 1GB: ~$0.25/mes
  - 5GB: ~$1.25/mes
  - 10GB: ~$2.50/mes
- **Total estimado**: ~$8-10/mes mínimo

#### Ventajas y Desventajas

✅ **Ventajas:**
- Todo en Render (no necesitas servicios externos)
- Control total sobre la base de datos
- Datos en tu propio disco

❌ **Desventajas:**
- Más caro que Atlas (gratis) o Railway
- Requiere configuración manual
- Debes gestionar backups manualmente
- Más complejo de configurar

⚠️ **Recomendación**: Si el costo no es problema y quieres todo en Render, esta opción funciona. Pero MongoDB Atlas (gratis) o Railway son más económicos y fáciles.

📖 **Para una guía paso a paso detallada, consulta**: [GUIA_MONGODB_RENDER.md](./GUIA_MONGODB_RENDER.md)

## Opción 2: Railway (Recomendado si quieres MongoDB incluido)

### ✅ Ventaja: Railway SÍ ofrece MongoDB como servicio

Railway tiene MongoDB como servicio nativo, así que NO necesitas MongoDB Atlas.

### Paso 1: Configurar MongoDB en Railway
1. Ve a [Railway](https://railway.app)
2. "New Project" → "New Database" → "MongoDB"
3. Railway creará automáticamente la base de datos
4. Obtén la connection string desde las variables de entorno del servicio MongoDB

### Paso 2: Desplegar Backend
1. En el mismo proyecto de Railway
2. "New Service" → "GitHub Repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente Node.js
5. Configuración:
   - **Root Directory**: (dejar vacío)
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
6. Variables de Entorno:
   ```
   NODE_ENV=production
   MONGODB_URI=${{MongoDB.MONGO_URL}}  # Conecta automáticamente al MongoDB de Railway
   JWT_SECRET=tu-secret-key-super-segura
   PORT=5000
   FRONTEND_URL=https://tu-frontend.railway.app
   ```
7. Conecta el servicio MongoDB: Click en "Variables" → "Reference Variable" → Selecciona MongoDB → MONGO_URL

### Paso 3: Desplegar Frontend
1. En el mismo proyecto de Railway
2. "New Service" → "GitHub Repo"
3. Selecciona tu repositorio
4. Configuración:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`
5. Variables de Entorno:
   ```
   REACT_APP_API_URL=https://tu-backend.railway.app/api
   ```

### ✅ Ventajas de Railway:
- MongoDB incluido (no necesitas Atlas)
- Todo en un solo lugar
- Muy fácil de configurar
- Plan gratuito con $5 de créditos mensuales

## Opción 3: Vercel (Frontend) + Render/Railway (Backend)

### Frontend en Vercel
1. Ve a [Vercel](https://vercel.com)
2. Importa tu repositorio
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Variables de entorno: `REACT_APP_API_URL=https://tu-backend.onrender.com/api`

### Backend
- Sigue los pasos de Render o Railway para el backend

## Variables de Entorno Importantes

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=generar-una-clave-segura-aleatoria
NODE_ENV=production
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=https://tu-backend.onrender.com/api
```

## Notas Importantes

1. **JWT_SECRET**: Genera una clave segura aleatoria para producción
2. **MongoDB**: Usa MongoDB Atlas (gratis hasta 512MB)
3. **CORS**: Actualiza los orígenes permitidos en producción
4. **HTTPS**: Render y Vercel incluyen SSL automático
5. **Build**: El frontend se construye como static site

## Troubleshooting

- **Error de conexión a MongoDB**: Verifica la URI y el whitelist de IPs en Atlas
- **CORS errors**: Verifica que la URL del frontend esté en la lista de orígenes permitidos
- **Build fails**: Revisa los logs en Render/Railway para ver el error específico

