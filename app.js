const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { testConnection, closePool } = require("./config/database");

// Importar rutas
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const specificationRoutes = require("./routes/specifications");

const app = express();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Sistema de Productos AIMEC",
      version: "1.0.0",
      description: "API REST para gestión de productos, categorías y especificaciones",
      contact: {
        name: "AIMEC",
        email: "info@aimec.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3750",
        description: "Servidor de desarrollo"
      }
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "integer" },
            sku: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            brand_id: { type: "integer" },
            category_id: { type: "integer" },
            is_active: { type: "boolean" }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            is_active: { type: "boolean" }
          }
        },
        Specification: {
          type: "object",
          properties: {
            id: { type: "integer" },
            product_id: { type: "integer" },
            specification_type_id: { type: "integer" },
            value: { type: "string" }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js", "./controllers/*.js"]
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    message: err.message 
  });
};

// Middleware para probar conexión a base de datos
app.use(async (req, res, next) => {
  if (!req.app.locals.dbInitialized) {
    try {
      await testConnection();
      req.app.locals.dbInitialized = true;
      console.log('✅ Conexión a base de datos establecida');
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error.message);
    }
  }
  next();
});

// =====================================================
// DOCUMENTACIÓN DE LA API
// =====================================================

// Servir la documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// =====================================================
// RUTAS PRINCIPALES
// =====================================================


/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar el estado del servidor
 *     description: Endpoint para verificar si el servidor está funcionando correctamente
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 database:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 version:
 *                   type: string
 *       500:
 *         description: Error del servidor
 */
app.get("/health", async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      success: true,
      status: "OK", 
      database: isConnected ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: "ERROR", 
      database: "Error",
      error: error.message 
    });
  }
});


/**
 * @swagger
 * /:
 *   get:
 *     summary: Información de la API
 *     description: Endpoint principal que muestra información sobre la API
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API de Sistema de Productos AIMEC",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      health: "/health",
      products: "/api/products",
      categories: "/api/categories",
      specifications: "/api/specifications"
    }
  });
});

// =====================================================
// RUTAS DE LA API
// =====================================================

// Rutas de productos
app.use("/api/products", productRoutes);

// Rutas de categorías, marcas y series
app.use("/api/categories", categoryRoutes);

// Rutas de especificaciones
app.use("/api/specifications", specificationRoutes);

// =====================================================
// MANEJO DE ERRORES
// =====================================================

// Middleware para rutas no encontradas (más específico para evitar conflictos con Swagger)
app.use((req, res) => {
  // Solo manejar rutas que no sean de Swagger
  if (!req.path.startsWith('/api-docs')) {
    res.status(404).json({
      success: false,
      error: "Ruta no encontrada",
      message: `La ruta ${req.originalUrl} no existe`,
      availableEndpoints: {
        health: "/health",
        apiDocs: "/api-docs",
        products: "/api/products",
        categories: "/api/categories",
        specifications: "/api/specifications"
      }
    });
  } else {
    // Para rutas de Swagger, dejar que Swagger las maneje
    res.status(404).send('Endpoint de documentación no encontrado');
  }
});

// Aplicar middleware de manejo de errores
app.use(errorHandler);

// =====================================================
// MANEJO DE CIERRE GRACEFUL
// =====================================================

process.on('SIGINT', async () => {
  console.log('🔄 Cerrando aplicación...');
  await closePool();
  console.log('✅ Aplicación cerrada correctamente');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando aplicación...');
  await closePool();
  console.log('✅ Aplicación cerrada correctamente');
  process.exit(0);
});

module.exports = app;
