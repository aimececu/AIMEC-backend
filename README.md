# AIMEC Backend API

API REST para el sistema de gestión de productos industriales AIMEC.

## 🚀 Características

- **Sincronización Automática**: La base de datos se sincroniza automáticamente al iniciar el servidor
- **Detección Inteligente de Cambios**: Solo sincroniza cuando detecta cambios en los modelos
- **Preservación de Datos**: No borra datos existentes al agregar nuevas columnas
- **API RESTful**: Endpoints bien documentados con Swagger
- **Autenticación JWT**: Sistema de autenticación seguro
- **Base de Datos PostgreSQL**: Con Sequelize ORM en Railway
- **Servicio de Email**: SMTP2GO para emails transaccionales
- **Despliegue en Railway**: Backend y base de datos alojados en Railway

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd AIMEC-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones de base de datos
```

4. **Configurar la base de datos**
```bash
# Crear la base de datos PostgreSQL
createdb aimec_db

# El servidor sincronizará automáticamente al iniciar
```

## 🚀 Uso

### Desarrollo Local
```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3750` y:
- ✅ Conectará automáticamente a la base de datos
- 🔄 Detectará cambios en los modelos y sincronizará si es necesario
- 📝 Creará datos de ejemplo en la primera ejecución
- 📚 Generará documentación Swagger en `/api-docs`

### Producción
```bash
npm start
```

## 🌐 Arquitectura de Despliegue

### Servicios Utilizados
- **Backend API**: Node.js en Railway
- **Base de Datos**: PostgreSQL en Railway
- **Frontend**: React en Vercel
- **Email**: SMTP2GO + Zoho Mail
- **Dominio**: [Configurar según necesidades]

### Variables de Entorno por Entorno

#### Desarrollo Local (.env)
```env
NODE_ENV=development
PORT=3750
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_SCHEMA=public

# Email - SMTP2GO
SMTP2GO_API_KEY=tu_api_key_de_smtp2go
SMTP2GO_FROM_EMAIL=tu-email@tudominio.com
SMTP2GO_FROM_NAME=AIMEC
CONTACT_EMAIL=tu-email@tudominio.com
```

#### Producción (Railway)
```env
NODE_ENV=production
PORT=3750
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=18274
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=tu_password_railway
DB_SCHEMA=aimec_products

# Email - SMTP2GO
SMTP2GO_API_KEY=api-A3FD07E87C234964A0266ED655C6FA54
SMTP2GO_FROM_EMAIL=info@aimec-ec.com
SMTP2GO_FROM_NAME=AIMEC
CONTACT_EMAIL=info@aimec-ec.com
```

## 📁 Estructura del Proyecto

```
AIMEC-backend/
├── config/           # Configuraciones (DB, CORS, etc.)
├── controllers/      # Controladores de la API
├── models/          # Modelos de Sequelize
├── routes/          # Rutas de la API
├── services/        # Lógica de negocio
├── app.js           # Configuración de Express
├── server.js        # Servidor principal
└── force-sync.js    # Script de emergencia
```

## 🔧 Configuración de Base de Datos

### Railway (Producción)
1. Crear proyecto en Railway
2. Agregar servicio PostgreSQL
3. Copiar variables de entorno desde Railway Dashboard
4. El backend también se despliega en Railway

### Variables de Entorno (.env)
```env
# Base de Datos
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=18274
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=tu_password_railway
DB_SCHEMA=aimec_products

# Entorno
NODE_ENV=production
PORT=3750

# Email - SMTP2GO
SMTP2GO_API_KEY=tu_api_key_de_smtp2go
SMTP2GO_FROM_EMAIL=info@aimec-ec.com
SMTP2GO_FROM_NAME=AIMEC
CONTACT_EMAIL=info@aimec-ec.com
```

## 📚 API Endpoints

### Documentación
- **Swagger UI**: `http://localhost:3750/api-docs` (desarrollo)
- **Swagger UI**: `https://tu-app.railway.app/api-docs` (producción)
- **Health Check**: `GET /health`

### Principales
- **Productos**: `GET/POST/PUT/DELETE /api/products`
- **Categorías**: `GET/POST/PUT/DELETE /api/categories`
- **Autenticación**: `POST /api/auth/login`
- **Email**: `POST /api/email/contact` (formulario de contacto)
- **Cotizaciones**: `POST /api/quotations` (enviar cotización)

## 📧 Configuración de Email

### SMTP2GO + Zoho Mail
El sistema utiliza SMTP2GO como servicio de email transaccional con Zoho Mail como proveedor de email.

#### Configuración SMTP2GO
1. **Registrarse en SMTP2GO**: [https://www.smtp2go.com/](https://www.smtp2go.com/)
2. **Obtener API Key**: Desde el dashboard de SMTP2GO
3. **Configurar dominio**: Verificar dominio de envío
4. **Configurar variables de entorno**:
   ```env
   SMTP2GO_API_KEY=tu_api_key_de_smtp2go
   SMTP2GO_FROM_EMAIL=info@aimec-ec.com
   SMTP2GO_FROM_NAME=AIMEC
   CONTACT_EMAIL=info@aimec-ec.com
   ```

#### Ventajas de SMTP2GO
- ✅ **Mayor confiabilidad**: Mejor tasa de entrega que SMTP tradicional
- ✅ **Analytics**: Tracking de emails enviados, entregados, abiertos
- ✅ **Fácil configuración**: Solo necesitas una API Key
- ✅ **Plan gratuito**: 1000 emails por mes
- ✅ **Sin configuración SMTP compleja**: No necesitas configurar puertos, SSL, etc.

#### Funcionalidades de Email
- **Formulario de contacto**: `POST /api/email/contact`
- **Envío de cotizaciones**: `POST /api/quotations`
- **Emails de prueba**: `POST /api/email/test`
- **Verificación de estado**: `GET /api/email/status`

## 🔄 Sistema de Sincronización

### Automático (Recomendado)
- **Al ejecutar `npm run dev`**: El servidor detecta automáticamente cambios en los modelos
- **Sincronización inteligente**: Solo modifica lo necesario, preserva datos existentes
- **Sin scripts adicionales**: Todo funciona automáticamente

### Manual (Solo en casos especiales)
```bash
# Forzar sincronización completa (BORRA TODOS LOS DATOS)
npm run force-sync
```

⚠️ **ADVERTENCIA**: `force-sync` elimina todos los datos de la base de datos.

## 🔍 Monitoreo

### Health Check
```bash
# Desarrollo
curl http://localhost:3750/health

# Producción
curl https://tu-app.railway.app/health
```

### Logs
Los logs se muestran en consola durante desarrollo y incluyen:
- ✅ Conexión a base de datos
- 🔄 Estado de sincronización
- 📝 Creación de datos de ejemplo
- ⚠️ Errores y advertencias

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos
1. Verificar que PostgreSQL esté ejecutándose
2. Revisar credenciales en `.env`
3. Verificar que la base de datos existe
4. **Railway**: Verificar variables de entorno en Railway Dashboard

### Error de Sincronización
1. Verificar permisos de la base de datos
2. Revisar logs del servidor
3. En casos extremos, usar `npm run force-sync`

### Problemas con Modelos
1. Verificar sintaxis de los modelos
2. Revisar relaciones entre modelos
3. Verificar tipos de datos

### Problemas con Email (SMTP2GO)
1. **Error "SMTP2GO_API_KEY no está configurado"**:
   - Verificar que la variable `SMTP2GO_API_KEY` esté en tu archivo `.env`
   - Reiniciar el servidor después de agregar la variable

2. **Error "SMTP2GO_FROM_EMAIL no está configurado"**:
   - Verificar que la variable `SMTP2GO_FROM_EMAIL` esté en tu archivo `.env`
   - Asegurarse de que el email esté verificado en SMTP2GO

3. **Error de conexión a la API de SMTP2GO**:
   - Verificar tu conexión a internet
   - Verificar que la API Key sea correcta
   - Verificar que tu cuenta de SMTP2GO esté activa

4. **Error SMTP2GO específico**:
   - Revisar el mensaje de error específico
   - Verificar que el dominio de envío esté configurado correctamente
   - Verificar que no hayas excedido el límite de emails (1000/mes en plan gratuito)

## 🔄 Migraciones

### Agregar Nueva Columna
1. Modificar el modelo correspondiente
2. Ejecutar `npm run dev`
3. La columna se agregará automáticamente

### Agregar Nueva Tabla
1. Crear nuevo modelo en `models/`
2. Ejecutar `npm run dev`
3. La tabla se creará automáticamente

### Cambios Complejos
Para cambios que requieren recrear la estructura:
```bash
npm run force-sync
```
⚠️ **ADVERTENCIA**: Esto elimina todos los datos.

## 📝 Desarrollo

### Agregar Nuevo Modelo
1. Crear archivo en `models/` (ej: `NewModel.js`)
2. Definir el modelo con Sequelize
3. Exportar en `models/index.js`
4. Ejecutar `npm run dev`

### Agregar Nuevo Endpoint
1. Crear controlador en `controllers/`
2. Crear ruta en `routes/`
3. Registrar ruta en `app.js`
4. Documentar con Swagger

## 🚀 Despliegue

### Railway (Backend + Base de Datos)
1. **Crear proyecto en Railway**
2. **Agregar servicio PostgreSQL**
3. **Conectar repositorio del backend**
4. **Configurar variables de entorno**:
   ```env
   NODE_ENV=production
   PORT=3750
   DB_HOST=yamabiko.proxy.rlwy.net
   DB_PORT=18274
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=tu_password_railway
   DB_SCHEMA=aimec_products
   SMTP2GO_API_KEY=tu_api_key_de_smtp2go
   SMTP2GO_FROM_EMAIL=info@aimec-ec.com
   SMTP2GO_FROM_NAME=AIMEC
   CONTACT_EMAIL=info@aimec-ec.com
   ```
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`

### Vercel (Frontend)
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Configuración de Dominio
1. Configurar DNS para apuntar a Railway (backend)
2. Configurar subdominio para Vercel (frontend)
3. Configurar SSL automático en Railway y Vercel

## 🛠️ Servicios Utilizados

### Backend y Base de Datos
- **Railway**: Hosting del backend Node.js y base de datos PostgreSQL
- **PostgreSQL**: Base de datos relacional con Sequelize ORM
- **Node.js**: Runtime de JavaScript para el backend

### Email
- **SMTP2GO**: Servicio de email transaccional para envío de correos
- **Zoho Mail**: Proveedor de email para la cuenta de envío (info@aimec-ec.com)

### Frontend
- **Vercel**: Hosting del frontend React
- **React**: Framework de JavaScript para la interfaz de usuario

### Características Técnicas
- **API REST**: Endpoints bien documentados con Swagger
- **Autenticación JWT**: Sistema de autenticación seguro
- **CORS**: Configuración para permitir requests desde el frontend
- **Rate Limiting**: Protección contra spam y abuso
- **Validación**: Validación de datos de entrada
- **Logging**: Sistema de logs para monitoreo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 