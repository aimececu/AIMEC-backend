const express = require("express");
const bodyParser = require("body-parser");
const { testConnection, closePool } = require("./config/database");
const { initializeDatabase } = require("./database/queries");

// Importar rutas
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const specificationRoutes = require("./routes/specifications");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    message: err.message 
  });
};

// Middleware para inicializar base de datos
app.use(async (req, res, next) => {
  if (!req.app.locals.dbInitialized) {
    try {
      await testConnection();
      await initializeDatabase();
      req.app.locals.dbInitialized = true;
      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar la base de datos:', error);
    }
  }
  next();
});

// =====================================================
// RUTAS PRINCIPALES
// =====================================================

// Ruta de salud para verificar la conexión
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

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API de Sistema de Productos AIMEC",
    version: "1.0.0",
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

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
    message: `La ruta ${req.originalUrl} no existe`
  });
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
