# Guía Paso a Paso: Configurar MongoDB Atlas

Esta guía te ayudará a configurar MongoDB Atlas desde cero para tu aplicación.

---

## 📋 Paso 1: Crear Cuenta en MongoDB Atlas

### 1.1. Registrarse
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Haz clic en **"Try Free"** o **"Sign Up"**
3. Completa el formulario:
   - Email
   - Contraseña
   - Nombre y apellido
4. Acepta los términos y condiciones
5. Haz clic en **"Create your Atlas account"**

### 1.2. Verificar Email
1. Revisa tu correo electrónico
2. Haz clic en el enlace de verificación
3. Serás redirigido al dashboard de Atlas

---

## 📋 Paso 2: Crear un Cluster

### 2.1. Seleccionar Tipo de Despliegue
1. En el dashboard, verás la opción **"Deploy a cloud database"**
2. Selecciona **"M0 FREE"** (el plan gratuito)
   - ✅ 512 MB de almacenamiento
   - ✅ Compartido (gratis)
   - ✅ Ideal para empezar

### 2.2. Seleccionar Proveedor y Región
1. **Cloud Provider**: Elige el que prefieras (AWS, Google Cloud, o Azure)
2. **Region**: Elige la región más cercana a ti
   - Ejemplo: Si estás en Argentina, elige `us-east-1` (N. Virginia) o `sa-east-1` (São Paulo)
3. Haz clic en **"Create"**

### 2.3. Nombrar el Cluster (Opcional)
- Puedes dejar el nombre por defecto o cambiarlo
- Ejemplo: `Cluster0` o `odontologia-cluster`

### 2.4. Esperar Creación
- El cluster tarda **3-5 minutos** en crearse
- Verás un mensaje: "Your cluster is being created"
- ⏳ **Espera hasta que termine**

---

## 📋 Paso 3: Configurar Acceso a la Red

### 3.1. Acceder a Network Access
1. Una vez creado el cluster, verás un mensaje de bienvenida
2. Haz clic en **"Network Access"** en el menú lateral izquierdo
   - O ve directamente: https://cloud.mongodb.com/v2#/security/network/list

### 3.2. Agregar IP Address
1. Haz clic en **"Add IP Address"** (botón verde)
2. Tienes dos opciones:

   **Opción A: Permitir desde cualquier lugar (Recomendado para empezar)**
   - Haz clic en **"Allow Access from Anywhere"**
   - Se agregará automáticamente: `0.0.0.0/0`
   - ⚠️ **Nota**: Esto permite acceso desde cualquier IP. Para producción, es mejor agregar IPs específicas.

   **Opción B: Agregar IP específica**
   - Si conoces la IP de Render, agrégala manualmente
   - Formato: `192.168.1.1/32`

3. Haz clic en **"Confirm"**
4. Verás tu IP en la lista (puede tardar unos segundos en aparecer)

---

## 📋 Paso 4: Crear Usuario de Base de Datos

### 4.1. Acceder a Database Access
1. Haz clic en **"Database Access"** en el menú lateral
   - O ve directamente: https://cloud.mongodb.com/v2#/security/database/users

### 4.2. Agregar Nuevo Usuario
1. Haz clic en **"Add New Database User"** (botón verde)

### 4.3. Configurar Usuario
1. **Authentication Method**: Selecciona **"Password"**
2. **Username**: Escribe un nombre de usuario
   - Ejemplo: `admin` o `odontologia-user`
3. **Password**: 
   - Haz clic en **"Autogenerate Secure Password"** (recomendado)
   - O crea tu propia contraseña segura
   - ⚠️ **IMPORTANTE**: Guarda esta contraseña en un lugar seguro, la necesitarás después

### 4.4. Asignar Privilegios
1. **Database User Privileges**: Selecciona **"Atlas admin"** (recomendado para empezar)
   - Esto le da todos los permisos necesarios
2. Haz clic en **"Add User"**
3. ⚠️ **IMPORTANTE**: Si generaste la contraseña automáticamente, **cópiala ahora** antes de cerrar la ventana

---

## 📋 Paso 5: Obtener Connection String

### 5.1. Ir al Cluster
1. Haz clic en **"Database"** en el menú lateral
2. Verás tu cluster listado
3. Haz clic en el botón **"Connect"** (junto a tu cluster)

### 5.2. Seleccionar Método de Conexión
1. Se abrirá un modal con opciones
2. Selecciona **"Connect your application"** (la tercera opción)

### 5.3. Copiar Connection String
1. Verás una URL como esta:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
2. Haz clic en el ícono de **copiar** (📋) para copiar la URL completa

### 5.4. Personalizar Connection String
1. Reemplaza `<username>` con tu usuario (ej: `admin`)
2. Reemplaza `<password>` con tu contraseña (la que guardaste antes)
3. Agrega el nombre de la base de datos al final:
   ```
   mongodb+srv://admin:TuPassword123@cluster0.xxxxx.mongodb.net/odontologia?retryWrites=true&w=majority
   ```
   - Nota: Agregué `/odontologia` antes del `?` para especificar el nombre de la base de datos

### 5.5. URL Final
Tu URL final debería verse así:
```
mongodb+srv://admin:TuPassword123@cluster0.xxxxx.mongodb.net/odontologia?retryWrites=true&w=majority
```

**Desglose:**
- `mongodb+srv://` = Protocolo de conexión
- `admin` = Tu usuario
- `TuPassword123` = Tu contraseña
- `cluster0.xxxxx.mongodb.net` = Dirección de tu cluster
- `odontologia` = Nombre de tu base de datos
- `?retryWrites=true&w=majority` = Opciones de conexión

---

## 📋 Paso 6: Usar en tu Aplicación

### 6.1. En Render (Variables de Entorno)
1. Ve a tu servicio en Render
2. Ve a **"Environment"** → **"Environment Variables"**
3. Agrega una nueva variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Pega tu connection string completa
     ```
     mongodb+srv://admin:TuPassword123@cluster0.xxxxx.mongodb.net/odontologia?retryWrites=true&w=majority
     ```
4. Haz clic en **"Save Changes"**
5. Render reiniciará automáticamente tu servicio

### 6.2. Verificar Conexión
1. Ve a los **"Logs"** de tu servicio en Render
2. Busca mensajes como:
   - ✅ `Conectado a MongoDB`
   - ✅ `MongoDB connected successfully`
3. Si ves errores, revisa:
   - Que la contraseña sea correcta (sin espacios)
   - Que el nombre de usuario sea correcto
   - Que la IP esté permitida en Network Access

---

## 🔧 Troubleshooting

### Error: "Authentication failed"
**Solución:**
- Verifica que el usuario y contraseña sean correctos
- Asegúrate de que no haya espacios en la URL
- Verifica que el usuario tenga permisos de "Atlas admin"

### Error: "IP not whitelisted"
**Solución:**
- Ve a "Network Access" en Atlas
- Agrega `0.0.0.0/0` para permitir desde cualquier lugar
- O agrega la IP específica de Render

### Error: "Connection timeout"
**Solución:**
- Verifica que el cluster esté activo (no pausado)
- Verifica que la región sea accesible
- Espera unos minutos y vuelve a intentar

### No puedo ver el botón "Connect"
**Solución:**
- Asegúrate de que el cluster esté completamente creado
- Refresca la página
- Espera unos minutos si acabas de crearlo

---

## ✅ Checklist Final

Antes de considerar que está listo:

- [ ] Cuenta en MongoDB Atlas creada
- [ ] Cluster M0 FREE creado y activo
- [ ] Network Access configurado (IP permitida)
- [ ] Usuario de base de datos creado
- [ ] Contraseña guardada en lugar seguro
- [ ] Connection string obtenida y personalizada
- [ ] Connection string agregada a variables de entorno en Render
- [ ] Logs muestran conexión exitosa

---

## 💡 Tips Importantes

1. **Plan Gratuito**: El plan M0 FREE es suficiente para empezar. Puedes actualizar después si necesitas más recursos.

2. **Seguridad**: 
   - Para producción, considera agregar IPs específicas en lugar de `0.0.0.0/0`
   - Usa contraseñas seguras
   - No compartas tu connection string públicamente

3. **Actualización de Plan**: 
   - Puedes actualizar a un plan de pago cuando lo necesites
   - Los datos se mantienen al actualizar
   - No hay penalización por cambiar de plan

4. **Backups**: 
   - El plan FREE no incluye backups automáticos
   - Considera hacer backups manuales si es importante

---

## 📞 Si Necesitas Ayuda

Si encuentras algún problema:
1. Revisa los logs de tu aplicación
2. Verifica que todas las configuraciones estén correctas
3. Consulta la [documentación oficial de MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

¡Listo! Ya tienes MongoDB Atlas configurado y listo para usar 🚀

