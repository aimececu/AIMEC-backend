npm au# Variables de Entorno - AIMEC Backend

Este documento explica todas las variables de entorno implementadas en el proyecto AIMEC Backend y cómo se utilizan.

## 📋 Índice

1. [Configuración de Entorno](#configuración-de-entorno)
2. [Base de Datos](#base-de-datos)
3. [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
4. [AWS S3](#aws-s3)
5. [CORS](#cors)
6. [Rate Limiting](#rate-limiting)
7. [Swagger](#swagger)
8. [Encriptación](#encriptación)
9. [Validación](#validación)
10. [Logging](#logging)

## 🔧 Configuración de Entorno

### NODE_ENV
- **Descripción**: Define el entorno de ejecución
- **Valores**: `development`, `production`, `test`
- **Por defecto**: `development`
- **Uso**: Controla el comportamiento de la aplicación (CORS, logging, validaciones)

```bash
NODE_ENV=production
```

### PORT
- **Descripción**: Puerto en el que se ejecutará el servidor
- **Por defecto**: `3750`
- **Uso**: Configuración del servidor Express

```bash
PORT=3750
```

## 🗄️ Base de Datos

### Configuración Local
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SCHEMA=public
```

### Configuración de Producción (Railway)
```bash
DATABASE_URL=postgresql://user:password@host:port/database
# O variables individuales:
DB_HOST=tu-railway-host.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=tu-railway-password
DB_SCHEMA=public
```

## 🔐 JWT (JSON Web Tokens)

### JWT_SECRET
- **Descripción**: Clave secreta para firmar y verificar tokens JWT
- **Por defecto**: `default_secret_change_in_production`
- **Importante**: Cambiar en producción por una clave segura

```bash
JWT_SECRET=tu_jwt_secret_super_seguro
```

### JWT_EXPIRES_IN
- **Descripción**: Tiempo de expiración de los tokens JWT
- **Por defecto**: `24h`
- **Formatos**: `1h`, `24h`, `7d`, `30d`

```bash
JWT_EXPIRES_IN=24h
```

## ☁️ AWS S3

### Configuración AWS
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
```

### Configuración S3
```bash
AWS_S3_BUCKET=tu-bucket-s3
AWS_S3_REGION=us-east-1
```

**Funcionalidades implementadas:**
- Subida de archivos a S3
- Eliminación de archivos de S3
- Generación de URLs firmadas temporales
- **Nota**: Usa AWS SDK v3 (más moderno y eficiente)
- Generación de URLs firmadas
- Validación de tipos de archivo
- Límites de tamaño (10MB)

## 🌐 CORS

### CORS_ORIGIN
- **Descripción**: URLs permitidas para CORS
- **Por defecto**: `http://localhost:5173`
- **Formato**: URLs separadas por comas

```bash
CORS_ORIGIN=http://localhost:5173,https://tu-dominio.com
```

**Comportamiento:**
- En desarrollo: Permite todos los orígenes
- En producción: Solo permite las URLs especificadas

## ⏱️ Rate Limiting

### RATE_LIMIT_WINDOW_MS
- **Descripción**: Ventana de tiempo para el rate limiting (en milisegundos)
- **Por defecto**: `900000` (15 minutos)

```bash
RATE_LIMIT_WINDOW_MS=900000
```

### RATE_LIMIT_MAX_REQUESTS
- **Descripción**: Número máximo de requests por ventana de tiempo
- **Por defecto**: `100`

```bash
RATE_LIMIT_MAX_REQUESTS=100
```

**Tipos de Rate Limiting implementados:**
1. **General**: 100 requests por 15 minutos
2. **Autenticación**: 5 intentos de login por 15 minutos
3. **Subida de archivos**: 10 subidas por hora

## 📚 Swagger

### SWAGGER_TITLE
- **Descripción**: Título de la documentación Swagger
- **Por defecto**: `AIMEC API`

```bash
SWAGGER_TITLE=AIMEC API
```

### SWAGGER_VERSION
- **Descripción**: Versión de la API
- **Por defecto**: `1.0.0`

```bash
SWAGGER_VERSION=1.0.0
```

### SWAGGER_DESCRIPTION
- **Descripción**: Descripción de la API
- **Por defecto**: `API REST para el sistema de gestión de productos industriales AIMEC`

```bash
SWAGGER_DESCRIPTION=API REST para el sistema de gestión de productos industriales AIMEC
```

## 🔒 Encriptación

### BCRYPT_SALT_ROUNDS
- **Descripción**: Número de rondas de salt para bcrypt
- **Por defecto**: `12`
- **Rango recomendado**: `10-14`

```bash
BCRYPT_SALT_ROUNDS=12
```

**Uso:**
- Encriptación de contraseñas en registro
- Verificación de contraseñas en login
- Configuración automática en el controlador de autenticación

## ✅ Validación

### VALIDATION_STRICT
- **Descripción**: Habilita validaciones estrictas
- **Por defecto**: `true`
- **Valores**: `true`, `false`

```bash
VALIDATION_STRICT=true
```

**Validaciones implementadas:**
- **Email**: Formato válido, longitud máxima
- **Contraseña**: Mínimo 8 caracteres, complejidad en modo estricto
- **Texto**: Longitud mínima y máxima, sanitización
- **URL**: Formato válido, protocolos permitidos
- **Números**: Rango mínimo y máximo

## 📝 Logging

### LOG_LEVEL
- **Descripción**: Nivel de logging
- **Por defecto**: `info`
- **Valores**: `error`, `warn`, `info`, `debug`

```bash
LOG_LEVEL=info
```

### LOG_FILE
- **Descripción**: Archivo de log
- **Por defecto**: `logs/app.log`

```bash
LOG_FILE=logs/app.log
```

## 🚀 Ejemplo de Archivo .env Completo

```bash
# ========================================
# CONFIGURACIÓN DE ENTORNO
# ========================================
NODE_ENV=development
PORT=3750

# ========================================
# BASE DE DATOS - DESARROLLO LOCAL
# ========================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SCHEMA=public

# ========================================
# JWT (JSON WEB TOKENS)
# ========================================
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# ========================================
# AWS (PARA DOMINIO Y ALMACENAMIENTO)
# ========================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key

# ========================================
# ALMACENAMIENTO DE IMÁGENES
# ========================================
AWS_S3_BUCKET=tu-bucket-s3
AWS_S3_REGION=us-east-1

# ========================================
# CORS (CROSS-ORIGIN RESOURCE SHARING)
# ========================================
CORS_ORIGIN=http://localhost:5173,https://tu-dominio.com

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ========================================
# SWAGGER (DOCUMENTACIÓN API)
# ========================================
SWAGGER_TITLE=AIMEC API
SWAGGER_VERSION=1.0.0
SWAGGER_DESCRIPTION=API REST para el sistema de gestión de productos industriales AIMEC

# ========================================
# ENCRIPTACIÓN
# ========================================
BCRYPT_SALT_ROUNDS=12

# ========================================
# VALIDACIÓN
# ========================================
VALIDATION_STRICT=true

# ========================================
# LOGGING
# ========================================
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🔧 Instalación de Dependencias

Para que todas las funcionalidades funcionen correctamente, instala las dependencias:

```bash
npm install express-rate-limit @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
```

## 📖 Uso en el Código

### Rate Limiting
```javascript
const { generalLimiter, authLimiter, uploadLimiter } = require('./config/rateLimit');

// Aplicar rate limiting global
app.use(generalLimiter);

// Aplicar rate limiting específico
router.post('/login', authLimiter, authController.login);
```

### JWT Authentication
```javascript
const { authenticateToken } = require('./config/jwt');

// Proteger ruta con JWT
router.get('/profile', authenticateToken, userController.getProfile);
```

### Validación de Entrada
```javascript
const { validateInput } = require('./config/validation');

const userSchema = {
  name: { type: 'text', required: true, minLength: 2, maxLength: 100 },
  email: { type: 'email', required: true },
  password: { type: 'password', required: true }
};

router.post('/register', validateInput(userSchema), authController.register);
```

### AWS S3 (SDK v3)
```javascript
const { uploadToS3, deleteFromS3, getSignedFileUrl } = require('./config/aws');

// Subir archivo
const result = await uploadToS3(file, key, contentType);

// Eliminar archivo
await deleteFromS3(key);

// Generar URL firmada temporal
const signedUrl = await getSignedFileUrl(key, 'getObject', 3600);
```

## 🔒 Seguridad

### Variables Críticas
- `JWT_SECRET`: Cambiar en producción
- `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`: Credenciales sensibles
- `DB_PASSWORD`: Contraseña de base de datos

### Recomendaciones
1. Nunca committear el archivo `.env` al repositorio
2. Usar variables de entorno en producción
3. Rotar claves JWT periódicamente
4. Usar IAM roles en AWS cuando sea posible
5. Configurar CORS correctamente en producción

## 🐛 Troubleshooting

### Error: "JWT_SECRET no está configurado"
- Verificar que la variable `JWT_SECRET` esté definida en el archivo `.env`

### Error: "AWS_S3_BUCKET no está configurado"
- Verificar que las variables de AWS estén configuradas correctamente

### Error: "Rate limit exceeded"
- Ajustar `RATE_LIMIT_MAX_REQUESTS` o `RATE_LIMIT_WINDOW_MS` según necesidades

### Error: "CORS origin not allowed"
- Verificar que `CORS_ORIGIN` incluya el dominio correcto
- En desarrollo, verificar que `NODE_ENV` no sea `production`
