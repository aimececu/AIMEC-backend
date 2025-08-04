# 🚀 AIMEC Backend - API REST con Node.js

Sistema de gestión de productos industriales con autenticación basada en sesiones, ORM Sequelize y arquitectura MVC.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Autenticación](#-autenticación)
- [Base de Datos](#-base-de-datos)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Estructura del Proyecto](#-estructura-del-proyecto)

## ✨ Características

- ✅ **Autenticación por SessionID**: Sistema seguro sin JWT
- ✅ **Arquitectura MVC**: Modelo-Vista-Controlador organizado
- ✅ **ORM Sequelize**: Gestión de base de datos PostgreSQL
- ✅ **Documentación Swagger**: API documentada automáticamente
- ✅ **Middleware de Seguridad**: Helmet, CORS, validación
- ✅ **Logging Personalizado**: Sistema de logs con colores
- ✅ **Manejo de Errores**: Centralizado y consistente
- ✅ **Serverless Ready**: Preparado para AWS Lambda
- ✅ **Validación de Datos**: Con Sequelize y middleware
- ✅ **Gestión de Sesiones**: Con limpieza automática

## 🛠️ Tecnologías

### Core
- **Node.js** (v18+) - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para Node.js

### Autenticación & Seguridad
- **SessionID** - Autenticación basada en sesiones
- **bcryptjs** - Hash de contraseñas
- **Helmet** - Headers de seguridad
- **CORS** - Cross-Origin Resource Sharing

### Desarrollo & Documentación
- **Swagger/OpenAPI** - Documentación de API
- **Morgan** - Logging de requests HTTP
- **Nodemon** - Auto-reload en desarrollo
- **Serverless Framework** - Despliegue serverless

## 🏗️ Arquitectura

```
AIMEC-backend/
├── app.js                 # Aplicación Express principal
├── server.js              # Servidor de desarrollo
├── handler.js             # Handler para Serverless
├── serverless.yml         # Configuración Serverless
├── models/                # Modelos Sequelize
│   └── User.js           # Modelo de usuario
├── controllers/           # Controladores MVC
│   ├── auth.js           # Autenticación
│   ├── products.js       # Productos
│   ├── categories.js     # Categorías
│   └── specifications.js # Especificaciones
├── routes/               # Rutas de la API
│   ├── auth.js           # Rutas de autenticación
│   ├── products.js       # Rutas de productos
│   ├── categories.js     # Rutas de categorías
│   └── specifications.js # Rutas de especificaciones
├── config/               # Configuraciones
│   ├── database.js       # Configuración de BD
│   ├── env.js            # Variables de entorno
│   ├── cors.js           # Configuración CORS
│   ├── swagger.js        # Configuración Swagger
│   ├── swagger-ui.js     # Configuración UI Swagger
│   ├── middlewares.js    # Middlewares comunes
│   └── logger.js         # Sistema de logging
└── scripts/              # Scripts de utilidad
    └── init-admin.js     # Inicialización de admin
```

## 🚀 Instalación

### Prerrequisitos
- Node.js v18 o superior
- PostgreSQL 12 o superior
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd AIMEC-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos
```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear schema
CREATE SCHEMA IF NOT EXISTS aimec_products;

-- Ejecutar script de inicialización
\i database_schema.sql
```

### 4. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables según tu configuración
nano .env
```

### 5. Inicializar usuario administrador
```bash
npm run init:admin
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# =====================================================
# CONFIGURACIÓN DE BASE DE DATOS
# =====================================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# =====================================================
# CONFIGURACIÓN DEL SERVIDOR
# =====================================================
PORT=3750
NODE_ENV=development

# =====================================================
# CONFIGURACIÓN DE SEGURIDAD
# =====================================================
SESSION_SECRET=tu_session_secret_super_seguro
CORS_ORIGIN=http://localhost:5173

# =====================================================
# CONFIGURACIÓN DE LOGGING
# =====================================================
LOG_LEVEL=info
```

### Configuración de Base de Datos

El sistema está configurado para usar:
- **Base de datos**: `postgres`
- **Schema**: `aimec_products`
- **Conexión**: Configurada en `config/database.js`

## 🎯 Uso

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar con Serverless (opcional)
npm run dev:serverless
```

### Producción

```bash
# Construir y ejecutar
npm run start

# Desplegar a AWS
npm run deploy
```

### Scripts Disponibles

```bash
npm run dev              # Desarrollo con Express
npm run dev:serverless   # Desarrollo con Serverless
npm run start            # Producción
npm run init:admin       # Inicializar usuario admin
npm run deploy           # Desplegar a AWS
npm run deploy:prod      # Desplegar a producción
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify` - Verificar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `POST /api/auth/register` - Registrar usuario (admin)

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/products/stats` - Estadísticas

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Especificaciones
- `GET /api/specifications` - Listar especificaciones
- `GET /api/specifications/:id` - Obtener especificación
- `POST /api/specifications` - Crear especificación
- `PUT /api/specifications/:id` - Actualizar especificación
- `DELETE /api/specifications/:id` - Eliminar especificación

### Sistema
- `GET /health` - Health check
- `GET /` - Información de la API
- `GET /api-docs` - Documentación Swagger

## 🔐 Autenticación

### Sistema de Sesiones

El backend utiliza un sistema de autenticación basado en **SessionID**:

1. **Login**: Usuario envía credenciales → Backend valida → Retorna SessionID
2. **Sesión**: SessionID se almacena en memoria (Map) con expiración de 24h
3. **Verificación**: Frontend envía SessionID en header `X-Session-ID`
4. **Middleware**: Backend verifica SessionID en cada request protegido
5. **Logout**: SessionID se elimina de memoria

### Flujo de Autenticación

```javascript
// 1. Login
POST /api/auth/login
{
  "email": "admin@aimec.com",
  "password": "admin123"
}

// Respuesta
{
  "success": true,
  "data": {
    "sessionId": "uuid-session-id",
    "user": { ... }
  }
}

// 2. Requests autenticados
GET /api/products
Headers: {
  "X-Session-ID": "uuid-session-id"
}
```

### Credenciales por Defecto

```
Email: admin@aimec.com
Password: admin123
```

### Seguridad

- ✅ **SessionID único**: Generado con UUID v4
- ✅ **Expiración automática**: 24 horas
- ✅ **Limpieza automática**: Sesiones expiradas se eliminan
- ✅ **Validación de usuario**: Verifica que el usuario esté activo
- ✅ **Headers seguros**: Helmet configura headers de seguridad

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Schema: aimec_products

-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Otras tablas según database_schema.sql
```

### Modelos Sequelize

- **User**: Gestión de usuarios y autenticación
- **Product**: Catálogo de productos
- **Category**: Categorías de productos
- **Specification**: Especificaciones técnicas

### Migraciones y Seeds

```bash
# Sincronizar modelos (desarrollo)
npm run init:admin

# En producción, usar migraciones
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## 💻 Desarrollo

### Estructura de Desarrollo

#### 1. Agregar Nuevo Endpoint

```javascript
// 1. Crear controlador en controllers/
const newController = {
  async getData(req, res) {
    // Lógica del controlador
  }
};

// 2. Crear ruta en routes/
router.get('/new-endpoint', newController.getData);

// 3. Agregar documentación Swagger
/**
 * @swagger
 * /api/new-endpoint:
 *   get:
 *     summary: Descripción del endpoint
 */
```

#### 2. Agregar Nuevo Modelo

```javascript
// 1. Crear modelo en models/
const NewModel = sequelize.define('NewModel', {
  // Definición de campos
});

// 2. Agregar relaciones
NewModel.associate = (models) => {
  // Definir asociaciones
};
```

### Debugging

#### Logs del Sistema

```bash
# Ver logs en tiempo real
npm run dev

# Logs incluyen:
# - Conexión a base de datos
# - Requests HTTP
# - Errores de autenticación
# - Generación de Swagger
```

#### Swagger UI

Accede a la documentación interactiva:
- **URL**: `http://localhost:3750/api-docs`
- **Funcionalidades**: Probar endpoints, ver esquemas, autenticación

#### Health Check

```bash
# Verificar estado del sistema
curl http://localhost:3750/health

# Respuesta esperada
{
  "success": true,
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Testing

```bash
# Ejecutar tests (cuando se implementen)
npm test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

## 🚀 Despliegue

### Despliegue Local

```bash
# Construir para producción
npm run build

# Ejecutar en producción
NODE_ENV=production npm start
```

### Despliegue Serverless (AWS)

```bash
# Configurar AWS CLI
aws configure

# Desplegar
npm run deploy

# Desplegar a producción
npm run deploy:prod
```

### Variables de Entorno en Producción

```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-production-password
SESSION_SECRET=your-production-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3750
CMD ["npm", "start"]
```

## 📁 Estructura del Proyecto

### Archivos Principales

- **`app.js`**: Configuración principal de Express
- **`server.js`**: Servidor de desarrollo
- **`handler.js`**: Handler para Serverless
- **`serverless.yml`**: Configuración de despliegue

### Carpetas de Configuración

- **`config/`**: Todas las configuraciones del sistema
- **`models/`**: Modelos de Sequelize
- **`controllers/`**: Lógica de negocio
- **`routes/`**: Definición de endpoints
- **`scripts/`**: Scripts de utilidad

### Archivos de Documentación

- **`README.md`**: Esta documentación
- **`database_schema.sql`**: Esquema de base de datos
- **`package.json`**: Dependencias y scripts

## 🔧 Configuración Avanzada

### Middleware Personalizado

```javascript
// config/middlewares.js
const setupMiddlewares = (app) => {
  // Middlewares de seguridad
  app.use(helmet());
  app.use(cors(corsOptions));
  
  // Middlewares de logging
  app.use(morgan('combined'));
  
  // Middlewares de parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
```

### Configuración de Swagger

```javascript
// config/swagger.js
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AIMEC API',
      version: '1.0.0',
      description: 'API para gestión de productos industriales'
    },
    servers: [
      { url: 'http://localhost:3750' }
    ]
  },
  apis: ['./routes/*.js']
};
```

### Sistema de Logging

```javascript
// config/logger.js
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  success: (message) => console.log(`[SUCCESS] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`)
};
```

## 🐛 Solución de Problemas

### Errores Comunes

#### 1. Error de Conexión a Base de Datos
```bash
# Verificar configuración
cat .env

# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
psql -U postgres -d postgres
```

#### 2. Error de Puerto en Uso
```bash
# Verificar puerto
lsof -i :3750

# Cambiar puerto en .env
PORT=3751
```

#### 3. Error de Permisos
```bash
# Verificar permisos de archivos
ls -la

# Corregir permisos
chmod 644 .env
```

### Logs de Debug

```bash
# Habilitar logs detallados
DEBUG=* npm run dev

# Ver logs específicos
DEBUG=sequelize:* npm run dev
```

## 📞 Soporte

### Recursos Adicionales

- **Documentación Swagger**: `http://localhost:3750/api-docs`
- **Health Check**: `http://localhost:3750/health`
- **API Info**: `http://localhost:3750/`

### Contacto

Para soporte técnico o preguntas:
- **Email**: soporte@aimec.com
- **Documentación**: Ver Swagger UI
- **Issues**: Crear issue en el repositorio

---

**¡El backend está listo para desarrollo y producción!** 🚀 