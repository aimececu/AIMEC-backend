const express = require('express');

// Importar configuraciones
const config = require('./config/env');
const { testConnection } = require('./config/database');
const setupMiddlewares = require('./config/middlewares');
const setupSwaggerUI = require('./config/swagger-ui');
const logger = require('./config/logger');

// Importar rutas
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const specificationRoutes = require('./routes/specifications');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const productRelatedRoutes = require('./routes/productRelated');
const productFeaturesRoutes = require('./routes/productFeatures');

const app = express();

// =====================================================
// CONFIGURACIÓN DE MIDDLEWARES
// =====================================================

setupMiddlewares(app);

// Removido middleware CORS adicional que causaba conflictos

// =====================================================
// MIDDLEWARE DE BASE DE DATOS
// =====================================================

// Middleware para inicializar base de datos automáticamente
app.use(async (req, res, next) => {
  if (!req.app.locals.dbInitialized) {
    try {
      // Solo probar conexión, sin sincronización automática
      await testConnection();
      
      req.app.locals.dbInitialized = true;
      logger.databaseConnected();
    } catch (error) {
      logger.databaseError(error);
    }
  }
  next();
});

// =====================================================
// DOCUMENTACIÓN DE LA API
// =====================================================

setupSwaggerUI(app);

// Log de Swagger generado
const specs = require('./config/swagger');
logger.swaggerGenerated(specs);

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
 *                 endpoints:
 *                   type: object
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API AIMEC - Sistema de Gestión de Productos Industriales",
    version: "1.0.0",
    endpoints: {
              health: "/health",
        apiDocs: "/api-docs",
        products: "/api/products",
        categories: "/api/categories",
        specifications: "/api/specifications",
        applications: "/api/applications",
        auth: "/api/auth"
    }
  });
});

// Endpoint de prueba CORS
app.get("/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS test successful",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    method: req.method
  });
});

// =====================================================
// RUTAS DE LA API
// =====================================================

// Rutas de productos
app.use("/api/products", productRoutes);

// Rutas de categorías
app.use("/api/categories", categoryRoutes);

// Rutas de especificaciones
app.use("/api/specifications", specificationRoutes);

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de aplicaciones
app.use("/api/applications", applicationRoutes);

// Rutas de productos relacionados
app.use("/api/products", productRelatedRoutes);

// Rutas de características de productos
app.use("/api/products", productFeaturesRoutes);

// =====================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// =====================================================

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Error de restricción única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Error de restricción única',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Error de referencia',
      message: 'El registro referenciado no existe'
    });
  }

  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
};

app.use(errorHandler);

// Middleware para rutas no encontradas (más específico para evitar conflictos con Swagger)
app.use((req, res) => {
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
    res.status(404).send('Endpoint de documentación no encontrado');
  }
});

module.exports = app;
