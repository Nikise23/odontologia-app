# Guía Paso a Paso: MongoDB en Render con Disco Persistente

## 📋 Paso 1: Crear el Servicio MongoDB

### 1.1. Iniciar Creación
1. En Render Dashboard, haz clic en **"New +"** (arriba a la derecha)
2. Selecciona **"Private Service"**

### 1.2. Seleccionar Fuente
- **Opción A: Desde Docker Image (Recomendado)**
  - Haz clic en la pestaña **"Existing Image"**
  - En el campo "Docker Image", escribe: `mongo:7.0`
  
- **Opción B: Desde Repositorio Git**
  - Si prefieres usar un Dockerfile personalizado (más avanzado)
  - Selecciona tu repositorio de GitHub

### 1.3. Configuración Básica
- **Name**: `odontologia-mongodb` (o el nombre que prefieras)
- **Region**: Elige la región más cercana a ti (ej: `Oregon (US West)`)
- **Branch**: (si usas Git, deja `main` o `master`)

### 1.4. Configuración del Servicio
- **Environment**: `Docker` (selecciona esto si usas imagen Docker)
- **Docker Image**: `mongo:7.0` (si elegiste Existing Image)
- **Docker Command**: (dejar vacío, MongoDB se inicia automáticamente)

### 1.5. Variables de Entorno (IMPORTANTE)
Haz clic en "Advanced" o busca la sección "Environment Variables" y agrega:

```
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=TuPasswordSuperSeguro123!
MONGO_INITDB_DATABASE=odontologia
```

⚠️ **IMPORTANTE**: 
- Cambia `TuPasswordSuperSeguro123!` por una contraseña segura
- Guarda esta contraseña en un lugar seguro, la necesitarás después

### 1.6. Puerto
- **Port**: `27017` (puerto por defecto de MongoDB)

### 1.7. Disco Persistente (MUY IMPORTANTE)
1. Busca la sección **"Disks"** o **"Persistent Disks"**
2. Haz clic en **"Add Disk"** o **"Attach Disk"**
3. Configuración del disco:
   - **Name**: `mongodb-data`
   - **Size**: 
     - Mínimo: `1` GB (para empezar)
     - Recomendado: `5` GB (para producción pequeña)
     - Para más datos: `10` GB o más
   - **Mount Path**: `/data/db` ⚠️ **ESTE ES EL MÁS IMPORTANTE**
     - Este es el directorio donde MongoDB guarda todos los datos
     - Si no usas este path, los datos se perderán al reiniciar

### 1.8. Crear el Servicio
1. Revisa toda la configuración
2. Haz clic en **"Create Private Service"**
3. Espera a que Render despliegue el servicio (puede tomar 2-5 minutos)

---

## 📋 Paso 2: Obtener la URL de Conexión

### 2.1. Una vez desplegado el servicio MongoDB
1. Ve a la página del servicio `odontologia-mongodb`
2. Busca la sección **"Info"** o **"Connection Info"**

### 2.2. URL Interna (para servicios en el mismo proyecto)
Render te dará algo como:
```
mongodb://admin:TuPasswordSuperSeguro123!@odontologia-mongodb:27017
```

### 2.3. URL Completa para tu aplicación
La URL completa que usarás será:
```
mongodb://admin:TuPasswordSuperSeguro123!@odontologia-mongodb:27017/odontologia?authSource=admin
```

**Desglose:**
- `admin` = Usuario root
- `TuPasswordSuperSeguro123!` = Tu contraseña
- `odontologia-mongodb` = Nombre del servicio (Render lo resuelve internamente)
- `27017` = Puerto
- `odontologia` = Nombre de la base de datos
- `authSource=admin` = Base de datos de autenticación

---

## 📋 Paso 3: Configurar el Backend para Conectarse

### 3.1. Crear/Editar el Servicio Backend
1. Si ya tienes el backend desplegado, ve a su configuración
2. Si no, crea un nuevo Web Service:
   - **Name**: `odontologia-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`

### 3.2. Agregar Variable de Entorno MONGODB_URI
1. En la página del servicio backend
2. Ve a la sección **"Environment"** o **"Environment Variables"**
3. Haz clic en **"Add Environment Variable"**
4. Agrega:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb://admin:TuPasswordSuperSeguro123!@odontologia-mongodb:27017/odontologia?authSource=admin`
     - ⚠️ Reemplaza `TuPasswordSuperSeguro123!` con la contraseña real que configuraste

### 3.3. Otras Variables de Entorno Necesarias
También agrega:
- **Key**: `NODE_ENV` → **Value**: `production`
- **Key**: `JWT_SECRET` → **Value**: (genera una clave aleatoria segura)
- **Key**: `PORT` → **Value**: `5000`
- **Key**: `FRONTEND_URL` → **Value**: `https://tu-frontend.onrender.com` (la URL de tu frontend)

### 3.4. Guardar y Reiniciar
1. Guarda los cambios
2. Render reiniciará automáticamente el servicio
3. Verifica los logs para confirmar que se conectó a MongoDB

---

## 📋 Paso 4: Verificar la Conexión

### 4.1. Revisar Logs del Backend
1. Ve a la página del servicio backend
2. Haz clic en **"Logs"**
3. Busca mensajes como:
   - ✅ `Conectado a MongoDB`
   - ✅ `MongoDB connected successfully`
   - ❌ Si ves errores, revisa la URL de conexión

### 4.2. Probar la Aplicación
1. Intenta iniciar sesión
2. Si funciona, la conexión está correcta

---

## 📋 Paso 5: Crear Usuario Admin

### Opción A: Desde la Terminal de Render
1. Ve al servicio backend
2. Abre la terminal (si Render la ofrece)
3. Ejecuta:
```bash
cd server
npm run crear-admin
```

### Opción B: Desde tu Máquina Local
1. Conecta tu máquina local a la base de datos de Render
2. Necesitarás la URL externa de MongoDB (si Render la proporciona)
3. O usa un cliente MongoDB como MongoDB Compass

### Opción C: Desde la Interfaz Web
1. Una vez que el sistema esté funcionando
2. Inicia sesión (si ya tienes un usuario)
3. Ve a "Usuarios" y crea el admin desde ahí

---

## 🔧 Troubleshooting

### Error: "Cannot connect to MongoDB"
**Solución:**
1. Verifica que ambos servicios estén en el mismo proyecto Render
2. Verifica que la URL use el nombre correcto del servicio: `odontologia-mongodb`
3. Verifica que la contraseña sea correcta (sin espacios extra)
4. Verifica que el puerto sea `27017`

### Error: "Authentication failed"
**Solución:**
1. Verifica que `MONGO_INITDB_ROOT_USERNAME` y `MONGO_INITDB_ROOT_PASSWORD` estén correctos
2. Verifica que uses `authSource=admin` en la URL
3. Asegúrate de que el usuario sea `admin` (el que configuraste)

### Los datos se pierden al reiniciar
**Solución:**
1. Verifica que el disco esté montado en `/data/db`
2. Verifica que el disco tenga espacio disponible
3. Verifica que el disco esté "attached" al servicio MongoDB

### No puedo ver la sección de Discos
**Solución:**
1. Asegúrate de estar en un plan que soporte discos (Starter o superior)
2. Los discos solo están disponibles en Private Services
3. Verifica que estés creando un "Private Service", no un "Web Service"

---

## 💰 Costos Estimados

- **Private Service (MongoDB)**: $7/mes (plan Starter)
- **Disco 5GB**: ~$1.25/mes
- **Web Service (Backend)**: Gratis (con limitaciones) o $7/mes
- **Static Site (Frontend)**: Gratis
- **Total estimado**: ~$8-15/mes

---

## ✅ Checklist Final

Antes de considerar que está listo:

- [ ] Servicio MongoDB creado y funcionando
- [ ] Disco persistente montado en `/data/db`
- [ ] Variables de entorno configuradas en MongoDB
- [ ] Backend configurado con `MONGODB_URI` correcta
- [ ] Logs del backend muestran conexión exitosa
- [ ] Puedes iniciar sesión en la aplicación
- [ ] Usuario admin creado

---

## 📞 Si Necesitas Ayuda

Si encuentras algún problema:
1. Revisa los logs de ambos servicios (MongoDB y Backend)
2. Verifica que todas las variables de entorno estén correctas
3. Asegúrate de que el disco esté correctamente montado
4. Verifica que ambos servicios estén en el mismo proyecto Render

