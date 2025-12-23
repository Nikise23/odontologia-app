# Guía de Despliegue: Backend + Frontend en un Solo Web Service

Esta guía te ayudará a desplegar tu aplicación completa (backend + frontend) en un solo Web Service de Render.

## 📋 Paso 1: Preparar el Repositorio

### 1.1. Asegúrate de tener todo en GitHub
```bash
git add .
git commit -m "Preparado para despliegue unificado"
git push origin main
```

---

## 📋 Paso 2: Configurar MongoDB Atlas

### 2.1. Crear Cluster en Atlas
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (Free tier)
3. Configura acceso a la red:
   - Click en "Network Access"
   - "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0) o agrega la IP de Render
4. Crea usuario de base de datos:
   - Click en "Database Access"
   - "Add New Database User"
   - Username: `admin` (o el que prefieras)
   - Password: Genera una contraseña segura
   - Guarda estas credenciales

### 2.2. Obtener Connection String
1. Click en "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Copia la connection string (algo como):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Reemplaza `<password>` con tu contraseña real
5. Agrega el nombre de la base de datos al final:
   ```
   mongodb+srv://admin:TuPassword@cluster0.xxxxx.mongodb.net/odontologia?retryWrites=true&w=majority
   ```

---

## 📋 Paso 3: Desplegar en Render

### 3.1. Crear Web Service
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `odontologia-app` (o como se llame)

### 3.2. Configuración del Servicio

**Información Básica:**
- **Name**: `odontologia-app` (o el nombre que prefieras)
- **Region**: Elige la región más cercana
- **Branch**: `main` (o `master`)

**Build & Deploy:**
- **Root Directory**: (dejar vacío - raíz del proyecto)
- **Environment**: `Node`
- **Build Command**: 
  ```
  npm run install-all && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

### 3.3. Variables de Entorno

Click en "Advanced" y agrega estas variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:TuPassword@cluster0.xxxxx.mongodb.net/odontologia?retryWrites=true&w=majority
JWT_SECRET=genera-una-clave-super-segura-aqui-minimo-32-caracteres
PORT=5000
```

⚠️ **IMPORTANTE**:
- Reemplaza `TuPassword` con tu contraseña real de Atlas
- Reemplaza `cluster0.xxxxx.mongodb.net` con tu cluster real
- Genera un `JWT_SECRET` seguro (puedes usar: `openssl rand -base64 32`)

### 3.4. Crear el Servicio
1. Revisa toda la configuración
2. Click en **"Create Web Service"**
3. Render comenzará a construir y desplegar tu aplicación
4. Esto puede tomar 5-10 minutos la primera vez

---

## 📋 Paso 4: Verificar el Despliegue

### 4.1. Revisar Logs
1. Una vez desplegado, ve a la sección **"Logs"**
2. Busca mensajes como:
   - ✅ `Conectado a MongoDB`
   - ✅ `Servidor ejecutándose en puerto 5000`
   - ✅ Build del frontend completado

### 4.2. Probar la Aplicación
1. Render te dará una URL como: `https://odontologia-app.onrender.com`
2. Abre esa URL en tu navegador
3. Deberías ver la página de login
4. Prueba iniciar sesión

---

## 📋 Paso 5: Crear Usuario Admin

### Opción A: Desde la Terminal de Render (si está disponible)
1. Ve al servicio
2. Abre la terminal
3. Ejecuta:
```bash
cd server
npm run crear-admin
```

### Opción B: Desde tu Máquina Local
1. Conecta tu máquina local a MongoDB Atlas
2. Ejecuta:
```bash
cd server
MONGODB_URI=tu-connection-string-de-atlas npm run crear-admin
```

### Opción C: Desde la Interfaz Web
1. Una vez que tengas acceso, crea el admin desde "Usuarios"

---

## 🔧 Configuración Adicional

### Variables de Entorno Opcionales

Si necesitas más configuración, puedes agregar:

```
FRONTEND_URL=https://odontologia-app.onrender.com
```

### Actualizar CORS (si es necesario)

Si tienes problemas de CORS, el servidor ya está configurado para permitir el mismo origen cuando están juntos.

---

## ✅ Checklist de Despliegue

- [ ] Repositorio en GitHub
- [ ] MongoDB Atlas configurado
- [ ] Cluster creado y usuario configurado
- [ ] Connection string obtenida
- [ ] Web Service creado en Render
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Variables de entorno configuradas
- [ ] Servicio desplegado exitosamente
- [ ] Logs muestran conexión a MongoDB
- [ ] Aplicación accesible en la URL de Render
- [ ] Usuario admin creado

---

## 🐛 Troubleshooting

### Error: "Build failed"
**Solución:**
- Verifica que `npm run install-all` funcione localmente
- Revisa los logs para ver el error específico
- Asegúrate de que todas las dependencias estén en package.json

### Error: "Cannot find module"
**Solución:**
- Verifica que el Root Directory esté vacío (raíz del proyecto)
- Asegúrate de que `install-all` instale dependencias en server y client

### Error: "MongoDB connection failed"
**Solución:**
- Verifica que la `MONGODB_URI` sea correcta
- Verifica que el whitelist de IPs en Atlas incluya todas las IPs (0.0.0.0/0)
- Verifica que el usuario y contraseña sean correctos

### La aplicación carga pero no funciona
**Solución:**
- Verifica que el frontend se haya construido correctamente (revisa logs)
- Verifica que las rutas de API funcionen: `https://tu-app.onrender.com/api/health`
- Revisa la consola del navegador para errores

---

## 💡 Ventajas de Despliegue Unificado

✅ **Un solo servicio** - Más fácil de gestionar
✅ **Un solo dominio** - No hay problemas de CORS
✅ **Más económico** - Un solo servicio en lugar de dos
✅ **Más simple** - Menos configuración

---

## 📝 Notas Importantes

1. **Primera vez**: El despliegue puede tardar 10-15 minutos
2. **Actualizaciones**: Cada push a GitHub desplegará automáticamente
3. **Logs**: Siempre revisa los logs si hay problemas
4. **Backups**: Configura backups en MongoDB Atlas si es importante

---

¡Listo! Tu aplicación estará disponible en `https://tu-app.onrender.com` 🚀

