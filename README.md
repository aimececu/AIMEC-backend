# AIMEC Backend API

API REST para el sistema de gestión de productos industriales AIMEC.

## 🚀 Características

- **Sincronización Automática**: La base de datos se sincroniza automáticamente al iniciar el servidor
- **Detección Inteligente de Cambios**: Solo sincroniza cuando detecta cambios en los modelos
- **Preservación de Datos**: No borra datos existentes al agregar nuevas columnas
- **API RESTful**: Endpoints bien documentados con Swagger
- **Autenticación JWT**: Sistema de autenticación seguro
- **Base de Datos PostgreSQL**: Con Sequelize ORM
- **Despliegue Multi-Cloud**: Configurado para Railway, Render, Vercel y AWS

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
- **Base de Datos**: PostgreSQL en Railway
- **Backend API**: Node.js en Render.com
- **Frontend**: React en Vercel
- **Dominio**: AWS Route 53
- **Almacenamiento**: [Por definir - opciones recomendadas abajo]

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
```

#### Producción (Render.com)
```env
NODE_ENV=production
PORT=10000
DB_HOST=tu-railway-host.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=tu-railway-password
DB_SCHEMA=public
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
4. Configurar en Render.com

### Variables de Entorno (.env)
```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_SCHEMA=public

# Entorno
NODE_ENV=development
PORT=3750

# AWS (para dominio)
AWS_REGION=us-east-1
```

## 📚 API Endpoints

### Documentación
- **Swagger UI**: `http://localhost:3750/api-docs` (desarrollo)
- **Swagger UI**: `https://tu-app.onrender.com/api-docs` (producción)
- **Health Check**: `GET /health`

### Principales
- **Productos**: `GET/POST/PUT/DELETE /api/products`
- **Categorías**: `GET/POST/PUT/DELETE /api/categories`
- **Autenticación**: `POST /api/auth/login`
- **Especificaciones**: `GET/POST/PUT/DELETE /api/specifications`

## 🖼️ Almacenamiento de Imágenes

### Opciones Recomendadas

#### 1. AWS S3 (Recomendado)
- **Ventajas**: Escalable, confiable, integración con AWS
- **Configuración**: Bucket S3 + CloudFront para CDN
- **Costo**: ~$0.023/GB/mes

#### 2. Cloudinary
- **Ventajas**: Optimización automática, transformaciones
- **Configuración**: Cuenta gratuita hasta 25GB
- **Costo**: Gratis para uso básico

#### 3. Railway Storage
- **Ventajas**: Mismo proveedor que la base de datos
- **Configuración**: Integrado con Railway
- **Costo**: Incluido en el plan

#### 4. Vercel Blob Storage
- **Ventajas**: Integración nativa con Vercel
- **Configuración**: Fácil setup
- **Costo**: $0.20/GB/mes

### Implementación Sugerida
```javascript
// Ejemplo con AWS S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
```

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
curl https://tu-app.onrender.com/health
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

### Render.com (Backend)
1. Conectar repositorio en Render
2. Configurar variables de entorno
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Puerto: `10000`

### Vercel (Frontend)
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Build Command: `npm run build`
4. Output Directory: `dist`

### AWS Route 53 (Dominio)
1. Registrar dominio en AWS
2. Configurar DNS en Route 53
3. Apuntar a Render (backend) y Vercel (frontend)

### Railway (Base de Datos)
1. Crear proyecto en Railway
2. Agregar servicio PostgreSQL
3. Copiar variables de entorno
4. Configurar en Render.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 