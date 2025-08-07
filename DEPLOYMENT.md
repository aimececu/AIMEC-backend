# 🚀 Guía de Despliegue - AIMEC

Esta guía te ayudará a desplegar el proyecto AIMEC en producción usando Railway, Render, Vercel y AWS.

## 📋 Arquitectura de Despliegue

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Base de       │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   Datos         │
│                 │    │                 │    │   (Railway)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Dominio       │
                    │   (AWS Route 53)│
                    └─────────────────┘
```

## 🗄️ 1. Base de Datos - Railway

### Paso 1: Crear Proyecto en Railway
1. Ve a [Railway.app](https://railway.app)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Selecciona "Deploy from GitHub repo" o "Start a new project"

### Paso 2: Agregar Base de Datos PostgreSQL
1. En tu proyecto, haz clic en "New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente una base de datos PostgreSQL

### Paso 3: Obtener Variables de Entorno
1. Ve a la pestaña "Variables" de tu base de datos
2. Copia las siguientes variables:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

## 🔧 2. Backend - Render.com

### Paso 1: Conectar Repositorio
1. Ve a [Render.com](https://render.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New" → "Web Service"
4. Conecta tu repositorio de GitHub
5. Selecciona el repositorio `AIMEC-backend`

### Paso 2: Configurar Servicio
- **Name**: `aimec-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (o el plan que prefieras)

### Paso 3: Configurar Variables de Entorno
En la sección "Environment Variables", agrega:

```env
# Entorno
NODE_ENV=production
PORT=10000

# Base de Datos (Railway)
DB_HOST=tu-railway-host.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=tu-railway-password
DB_SCHEMA=public

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_y_largo
JWT_EXPIRES_IN=24h

# AWS (para dominio y almacenamiento)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
AWS_S3_BUCKET=tu-bucket-s3
AWS_S3_REGION=us-east-1

# CORS
CORS_ORIGIN=https://tu-dominio.com,https://tu-app.vercel.app

# Logging
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Swagger
SWAGGER_TITLE=AIMEC API
SWAGGER_VERSION=1.0.0
SWAGGER_DESCRIPTION=API REST para el sistema de gestión de productos industriales AIMEC

# Encriptación
BCRYPT_SALT_ROUNDS=12

# Validación
VALIDATION_STRICT=true
```

### Paso 4: Desplegar
1. Haz clic en "Create Web Service"
2. Render comenzará a construir y desplegar tu aplicación
3. Una vez completado, obtendrás una URL como: `https://tu-app.onrender.com`

## 🌐 3. Frontend - Vercel

### Paso 1: Conectar Repositorio
1. Ve a [Vercel.com](https://vercel.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Importa tu repositorio de GitHub
5. Selecciona el directorio `AIMEC` (frontend)

### Paso 2: Configurar Proyecto
- **Framework Preset**: `Vite`
- **Root Directory**: `AIMEC`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Paso 3: Configurar Variables de Entorno
```env
VITE_API_URL=https://tu-app.onrender.com
VITE_APP_NAME=AIMEC
VITE_APP_VERSION=1.0.0
```

### Paso 4: Desplegar
1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación
3. Obtendrás una URL como: `https://tu-app.vercel.app`

## 🌍 4. Dominio - AWS Route 53

### Paso 1: Registrar Dominio
1. Ve a [AWS Route 53](https://aws.amazon.com/route53/)
2. Ve a "Registered domains"
3. Haz clic en "Register Domain"
4. Busca y registra tu dominio (ej: `aimec.com`)

### Paso 2: Configurar DNS
1. Ve a "Hosted zones"
2. Selecciona tu dominio
3. Crea los siguientes registros:

#### Para el Backend (API)
```
Type: CNAME
Name: api
Value: tu-app.onrender.com
TTL: 300
```

#### Para el Frontend
```
Type: CNAME
Name: www
Value: tu-app.vercel.app
TTL: 300
```

#### Redirección de raíz
```
Type: CNAME
Name: @
Value: www.tu-dominio.com
TTL: 300
```

## 🖼️ 5. Almacenamiento de Imágenes

### Opción 1: AWS S3 (Recomendado)

#### Paso 1: Crear Bucket S3
1. Ve a [AWS S3](https://aws.amazon.com/s3/)
2. Crea un nuevo bucket
3. Nombre: `aimec-images` (o el que prefieras)
4. Región: `us-east-1`
5. Configuración:
   - Bloquear acceso público: `No`
   - Versioning: `Enabled`
   - Server-side encryption: `Enabled`

#### Paso 2: Configurar CORS
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["https://tu-dominio.com", "https://tu-app.vercel.app"],
        "ExposeHeaders": []
    }
]
```

#### Paso 3: Crear Usuario IAM
1. Ve a [AWS IAM](https://aws.amazon.com/iam/)
2. Crea un nuevo usuario
3. Adjunta la política `AmazonS3FullAccess`
4. Genera Access Keys
5. Copia las keys a las variables de entorno

### Opción 2: Cloudinary (Alternativa)

#### Paso 1: Crear Cuenta
1. Ve a [Cloudinary](https://cloudinary.com)
2. Crea una cuenta gratuita
3. Obtén las credenciales del dashboard

#### Paso 2: Configurar Variables
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 🔒 6. Seguridad

### Variables Sensibles
- `JWT_SECRET`: Usa un string largo y aleatorio
- `DB_PASSWORD`: Contraseña de Railway
- `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`: Keys de AWS

### CORS
Configura correctamente los orígenes permitidos:
```env
CORS_ORIGIN=https://tu-dominio.com,https://tu-app.vercel.app
```

### Rate Limiting
El backend incluye rate limiting configurado:
- 100 requests por 15 minutos por IP

## 📊 7. Monitoreo

### Health Checks
- Backend: `https://tu-app.onrender.com/health`
- Frontend: `https://tu-app.vercel.app`

### Logs
- **Render**: Ve a tu servicio → "Logs"
- **Vercel**: Ve a tu proyecto → "Functions" → "Logs"
- **Railway**: Ve a tu base de datos → "Logs"

## 🚨 8. Solución de Problemas

### Error de Conexión a Base de Datos
1. Verifica las variables de entorno en Render
2. Confirma que Railway esté funcionando
3. Revisa los logs de Render

### Error de CORS
1. Verifica `CORS_ORIGIN` en las variables de entorno
2. Asegúrate de incluir todos los dominios necesarios

### Error de Build
1. Verifica que `package.json` tenga los scripts correctos
2. Revisa los logs de build en Render/Vercel

### Error de Dominio
1. Verifica que los registros DNS estén configurados correctamente
2. Espera hasta 48 horas para propagación completa

## 📈 9. Escalabilidad

### Render.com
- Plan Free: 750 horas/mes
- Plan Starter: $7/mes - Sin límite de horas
- Plan Standard: $25/mes - Mejor rendimiento

### Vercel
- Plan Hobby: Gratis
- Plan Pro: $20/mes - Más funciones

### Railway
- Plan Free: $5 de crédito/mes
- Plan Pro: $20/mes - Más recursos

### AWS S3
- ~$0.023/GB/mes
- CloudFront CDN: ~$0.085/GB transferido

## 🔄 10. Actualizaciones

### Backend
1. Haz push a la rama principal
2. Render se actualizará automáticamente

### Frontend
1. Haz push a la rama principal
2. Vercel se actualizará automáticamente

### Base de Datos
- Los cambios en modelos se sincronizan automáticamente
- Para cambios complejos, usa `npm run force-sync` (¡CUIDADO!)

## 📞 11. Soporte

- **Railway**: [Discord](https://discord.gg/railway)
- **Render**: [Documentación](https://render.com/docs)
- **Vercel**: [Documentación](https://vercel.com/docs)
- **AWS**: [Soporte](https://aws.amazon.com/support/)

---

¡Tu aplicación AIMEC estará lista para producción! 🎉
