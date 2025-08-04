# 🏭 AIMEC Backend - API de Gestión de Productos Industriales

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Base de Datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [Documentación](#-documentación)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Descripción del Proyecto

AIMEC Backend es una API REST desarrollada en Node.js que gestiona un catálogo de productos industriales. La aplicación utiliza una arquitectura MVC (Model-View-Controller) con Sequelize como ORM para PostgreSQL.

### ✨ Características Principales

- **Gestión de Productos**: CRUD completo con búsqueda y filtros
- **Categorización**: Sistema de categorías y subcategorías
- **Marcas**: Gestión de marcas y series de productos
- **Especificaciones**: Especificaciones técnicas de productos
- **Seguridad**: Middlewares de seguridad implementados
- **Documentación**: Swagger UI integrado
- **Validaciones**: Validaciones automáticas de datos

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos

### Seguridad y Middlewares
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Seguridad HTTP
- **Morgan** - Logging de requests
- **Validator** - Validaciones de datos

### Desarrollo
- **Nodemon** - Auto-reload en desarrollo
- **Swagger** - Documentación API
- **Dotenv** - Variables de entorno

---

## 📁 Estructura del Proyecto

```
AIMEC-backend/
├── 📂 config/                 # Configuración de la aplicación
│   ├── database.js           # Configuración de Sequelize
│   └── env.js                # Variables de entorno
├── 📂 controllers/           # Controladores (Manejo de requests/responses)
│   ├── products.js          # Controlador de productos
│   ├── categories.js        # Controlador de categorías
│   └── specifications.js    # Controlador de especificaciones
├── 📂 models/               # Modelos de datos (Sequelize)
│   ├── index.js            # Configuración de asociaciones
│   ├── Product.js          # Modelo de productos
│   ├── Category.js         # Modelo de categorías
│   ├── Brand.js            # Modelo de marcas
│   └── ...                 # Otros modelos
├── 📂 services/            # Lógica de negocio
│   ├── ProductService.js   # Servicios de productos
│   └── CategoryService.js  # Servicios de categorías
├── 📂 routes/              # Definición de rutas
│   ├── products.js         # Rutas de productos
│   ├── categories.js       # Rutas de categorías
│   └── specifications.js   # Rutas de especificaciones
├── 📂 scripts/             # Scripts de utilidad
│   └── init-database.js    # Inicialización de BD
├── 📂 public/              # Archivos estáticos
├── app.js                  # Aplicación principal
├── server.js               # Servidor
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

---

## 🚀 Instalación y Configuración

### 1. Prerrequisitos

- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)
- **npm** o **yarn**

### 2. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd AIMEC-backend
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# =====================================================
# CONFIGURACIÓN DE BASE DE DATOS
# =====================================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SCHEMA=aimec_products

# =====================================================
# CONFIGURACIÓN DEL SERVIDOR
# =====================================================
PORT=3000
NODE_ENV=development

# =====================================================
# CONFIGURACIÓN DE SEGURIDAD
# =====================================================
JWT_SECRET=tu_jwt_secret_super_seguro
```

### 5. Configurar Base de Datos

```bash
# Crear la base de datos (si no existe)
createdb postgres

# Inicializar tablas y esquemas
npm run db:init
```

### 6. Iniciar el Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev:express

# Producción
npm start
```

---

## 🗄️ Base de Datos

### Configuración

La aplicación utiliza PostgreSQL con el esquema `aimec_products`. La configuración se encuentra en `config/database.js`.

### Modelos Principales

#### Product (Productos)
```javascript
{
  id: INTEGER (PK),
  sku: STRING(50) UNIQUE,        // Código único del producto
  name: STRING(255),             // Nombre del producto
  description: TEXT,             // Descripción completa
  short_description: TEXT,       // Descripción corta
  price: DECIMAL(10,2),          // Precio
  sale_price: DECIMAL(10,2),     // Precio de oferta
  stock_quantity: INTEGER,       // Cantidad en stock
  brand_id: INTEGER (FK),        // Referencia a marca
  category_id: INTEGER (FK),     // Referencia a categoría
  subcategory_id: INTEGER (FK),  // Referencia a subcategoría
  series_id: INTEGER (FK),       // Referencia a serie
  slug: STRING(255) UNIQUE,      // URL amigable
  is_active: BOOLEAN,            // Estado activo
  is_featured: BOOLEAN,          // Producto destacado
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

#### Category (Categorías)
```javascript
{
  id: INTEGER (PK),
  name: STRING(100),             // Nombre de la categoría
  description: TEXT,             // Descripción
  slug: STRING(100) UNIQUE,      // URL amigable
  image: STRING(500),            // Imagen de la categoría
  icon: STRING(100),             // Icono
  color: STRING(7),              // Color (#FFFFFF)
  sort_order: INTEGER,           // Orden de visualización
  is_active: BOOLEAN,            // Estado activo
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

#### Brand (Marcas)
```javascript
{
  id: INTEGER (PK),
  name: STRING(100),             // Nombre de la marca
  description: TEXT,             // Descripción
  logo: STRING(500),             // Logo de la marca
  website: STRING(255),          // Sitio web
  country: STRING(100),          // País de origen
  founded_year: INTEGER,         // Año de fundación
  is_active: BOOLEAN,            // Estado activo
  sort_order: INTEGER,           // Orden de visualización
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Relaciones entre Modelos

- **Product** → pertenece a **Brand**, **Category**, **Subcategory**, **ProductSeries**
- **Category** → tiene muchos **Product** y **Subcategory**
- **Brand** → tiene muchos **Product** y **ProductSeries**
- **Subcategory** → pertenece a **Category**

---

## 📚 API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints Principales

#### 🔍 Health Check
```http
GET /health
```
Verifica el estado del servidor y la conexión a la base de datos.

#### 📖 Información de la API
```http
GET /
```
Información general de la API y endpoints disponibles.

### Productos

#### Listar Productos
```http
GET /api/products
```

**Parámetros de consulta:**
- `category_id` - Filtrar por categoría
- `brand_id` - Filtrar por marca
- `min_price` - Precio mínimo
- `max_price` - Precio máximo
- `featured` - Solo productos destacados
- `in_stock` - Solo productos en stock
- `limit` - Límite de resultados
- `offset` - Desplazamiento para paginación

**Ejemplo:**
```bash
curl "http://localhost:3000/api/products?category_id=1&limit=10"
```

#### Obtener Producto por ID
```http
GET /api/products/:id
```

#### Obtener Producto por Slug
```http
GET /api/products/slug/:slug
```

#### Crear Producto
```http
POST /api/products
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "Motor Eléctrico 5HP",
  "description": "Motor eléctrico de 5 caballos de fuerza",
  "price": 1500.00,
  "brand_id": 1,
  "category_id": 1,
  "slug": "motor-electrico-5hp"
}
```

#### Actualizar Producto
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Motor Eléctrico 5HP Actualizado",
  "price": 1600.00
}
```

#### Eliminar Producto
```http
DELETE /api/products/:id
```

#### Buscar Productos
```http
GET /api/products/search?q=motor
```

#### Productos Destacados
```http
GET /api/products/featured
```

### Categorías

#### Listar Categorías
```http
GET /api/categories
```

#### Obtener Categoría por ID
```http
GET /api/categories/:id
```

#### Crear Categoría
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Motores",
  "description": "Categoría de motores eléctricos",
  "slug": "motores",
  "color": "#FF5733"
}
```

#### Actualizar Categoría
```http
PUT /api/categories/:id
```

#### Eliminar Categoría
```http
DELETE /api/categories/:id
```

#### Subcategorías de una Categoría
```http
GET /api/categories/:categoryId/subcategories
```

### Marcas

#### Listar Marcas
```http
GET /api/categories/brands
```

#### Obtener Marca por ID
```http
GET /api/categories/brands/:id
```

#### Crear Marca
```http
POST /api/categories/brands
Content-Type: application/json

{
  "name": "Siemens",
  "description": "Marca alemana de equipos industriales",
  "country": "Alemania",
  "founded_year": 1847
}
```

#### Actualizar Marca
```http
PUT /api/categories/brands/:id
```

#### Eliminar Marca
```http
DELETE /api/categories/brands/:id
```

### Respuestas de la API

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    // Datos del recurso
  },
  "message": "Operación realizada correctamente"
}
```

#### Respuesta con Paginación
```json
{
  "success": true,
  "data": [
    // Array de recursos
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Respuesta de Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "details": [
    {
      "field": "name",
      "message": "El nombre es requerido"
    }
  ]
}
```

---

## 📖 Documentación

### Swagger UI
La documentación interactiva está disponible en:
```
http://localhost:3000/api-docs
```

### Health Check
Verificar el estado del servidor:
```
http://localhost:3000/health
```

---

## 🔧 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev:express          # Servidor Express con Swagger UI (desarrollo)
npm run dev:serverless       # Servidor Serverless sin Swagger (producción)

# Producción
npm start                    # Servidor de producción
npm run deploy               # Desplegar en AWS
```

### Modos de Desarrollo

#### 🖥️ Express.js (Recomendado para desarrollo)
- **Swagger UI**: Disponible en `/api-docs`
- **Hot reload**: Con nodemon
- **Debugging**: Más fácil
- **Documentación**: Completa con Swagger

#### ☁️ Serverless (Para pruebas de producción)
- **Sin Swagger**: Optimizado para producción
- **AWS Lambda**: Simulación local
- **Rendimiento**: Máximo rendimiento sin overhead de documentación

### Estructura MVC

#### Model (Modelo)
- **Ubicación**: `/models/`
- **Responsabilidad**: Definir estructura de datos y relaciones
- **Tecnología**: Sequelize ORM

#### View (Vista)
- **Ubicación**: `/controllers/`
- **Responsabilidad**: Manejar requests HTTP y responses
- **Características**: Validación de entrada, formateo de respuestas

#### Controller (Controlador)
- **Ubicación**: `/services/`
- **Responsabilidad**: Lógica de negocio
- **Características**: Operaciones CRUD, validaciones de negocio

### Middlewares de Seguridad

#### CORS
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

#### Helmet
```javascript
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
```

#### Morgan (Logging)
```javascript
app.use(morgan('combined'));
```

### Manejo de Errores

La aplicación incluye manejo automático de errores para:

- **Errores de validación** (SequelizeValidationError)
- **Errores de restricción única** (SequelizeUniqueConstraintError)
- **Errores de clave foránea** (SequelizeForeignKeyConstraintError)
- **Errores generales** (500 Internal Server Error)

---

## 🚀 Despliegue

### Variables de Entorno para Producción

```env
NODE_ENV=production
PORT=3000
DB_HOST=tu_host_produccion
DB_PORT=5432
DB_NAME=postgres
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro
DB_SCHEMA=aimec_products
```

### Despliegue en AWS (Serverless)

```bash
# Instalar Serverless Framework
npm install -g serverless

# Configurar credenciales AWS
aws configure

# Desplegar
npm run deploy
```

### Despliegue Tradicional

```bash
# Construir para producción
npm run build

# Iniciar servidor
npm start
```

---

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```
❌ Error al conectar con la base de datos: connection refused
```

**Solución:**
- Verificar que PostgreSQL esté ejecutándose
- Verificar credenciales en `.env`
- Verificar que la base de datos `postgres` exista

#### 2. Error de Esquema
```
❌ relation "products" does not exist
```

**Solución:**
```bash
npm run db:init
```

#### 3. Error de Puerto en Uso
```
❌ EADDRINUSE: address already in use :::3000
```

**Solución:**
- Cambiar puerto en `.env`
- O matar el proceso que usa el puerto:
```bash
lsof -ti:3000 | xargs kill -9
```

#### 4. Error de Dependencias
```
❌ Cannot find module 'sequelize'
```

**Solución:**
```bash
npm install
```

### Logs y Debugging

#### Habilitar Logs de Sequelize
```javascript
// En config/database.js
logging: console.log
```

#### Logs de Morgan
Los logs de requests se muestran automáticamente en la consola.

### Verificación de Instalación

```bash
# 1. Verificar Node.js
node --version

# 2. Verificar PostgreSQL
psql --version

# 3. Verificar conexión a BD
npm run db:init

# 4. Verificar servidor
npm run dev:express
```

### Comandos Útiles

```bash
# Verificar estado de la API
curl http://localhost:3000/health

# Verificar documentación
curl http://localhost:3000/api-docs

# Verificar endpoints
curl http://localhost:3000/
```

---

## 📞 Soporte

### Recursos Adicionales

- **Documentación Sequelize**: https://sequelize.org/
- **Documentación Express**: https://expressjs.com/
- **Documentación PostgreSQL**: https://www.postgresql.org/docs/

### Contacto

Para soporte técnico o preguntas sobre el proyecto:
- **Email**: support@aimec.com
- **Documentación**: `/api-docs`

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Gracias por usar AIMEC Backend! 🚀** 