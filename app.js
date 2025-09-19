const express = require('express');

// Importar configuraciones
const config = require('./config/env');
const { testConnection } = require('./config/database');
const setupMiddlewares = require('./config/middlewares');
const setupSwaggerUI = require('./config/swagger-ui');


// Importar rutas
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const subcategoryRoutes = require('./routes/subcategories');
const brandRoutes = require('./routes/brands');
const authRoutes = require('./routes/auth');
const infoRoutes = require('./routes/info');
const importRoutes = require('./routes/import');
const productFeaturesRoutes = require('./routes/productFeatures');
const productApplicationsRoutes = require('./routes/productApplications');
const accessoryRoutes = require('./routes/accessories');
const relatedProductRoutes = require('./routes/relatedProducts');
const emailRoutes = require('./routes/email');
const quotationRoutes = require('./routes/quotations');

const app = express();

// =====================================================
// CONFIGURACIÓN DE PROXY TRUST
// =====================================================

// Configurar trust proxy para manejar headers de proxy (Railway, Vercel, etc.)
app.set('trust proxy', true);

// =====================================================
// CONFIGURACIÓN DE MIDDLEWARES
// =====================================================

setupMiddlewares(app);

// =====================================================
// MIDDLEWARE DE BASE DE DATOS
// =====================================================

// Middleware para inicializar base de datos automáticamente
app.use(async (req, res, next) => {
  if (!req.app.locals.dbInitialized) {
    try {
      // Probar conexión
      await testConnection();
      
      // Sincronizar base de datos automáticamente
      // const { syncDatabase } = require('./config/database');
      // await syncDatabase();
      
      // Crear usuario administrador por defecto
      const { createAdminUser } = require('./scripts/create-admin-user');
      await createAdminUser();
      
      req.app.locals.dbInitialized = true;
      console.log('✅ Conexión a base de datos establecida');
    } catch (error) {
      console.log('❌ Error al conectar con la base de datos:', error.message);
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
console.log('📚 Especificaciones de Swagger generadas');

// =====================================================
// RUTAS PRINCIPALES
// =====================================================

// Endpoint de salud del sistema
app.get("/health", async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      success: true,
      status: "OK", 
      database: isConnected ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      server: {
        port: config.port,
        environment: config.nodeEnv,
        host: req.get('host') || 'localhost'
      }
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

// Endpoint principal de información
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API AIMEC - Sistema de Gestión de Productos Industriales",
    version: "1.0.0",
    server: {
      port: config.port,
      environment: config.nodeEnv,
      host: req.get('host') || 'localhost'
    },
    endpoints: {
      health: "/health",
      apiDocs: "/api-docs",
      products: "/api/products",
      productFeatures: "/api/productFeatures",
      productApplications: "/api/productApplications",
      accessories: "/api/accessories",
      relatedProducts: "/api/relatedProducts",
      categories: "/api/categories",
      brands: "/api/brands",
      info: "/api/info",
      import: "/api/import",
      auth: "/api/auth",
      email: "/api/email",
      quotations: "/api/quotations"
    }
  });
});

// =====================================================
// RUTAS DE LA API
// =====================================================


// Rutas de productos
app.use("/api/products", productRoutes);



// Rutas de características de productos
app.use("/api/productFeatures", productFeaturesRoutes);

// Rutas de aplicaciones de productos
app.use("/api/productApplications", productApplicationsRoutes);

// Rutas de accesorios
app.use("/api/accessories", accessoryRoutes);

// Rutas de productos relacionados
app.use("/api/relatedProducts", relatedProductRoutes);

// Rutas de categorías
app.use("/api/categories", categoryRoutes);

// Rutas de subcategorías
app.use("/api/subcategories", subcategoryRoutes);

// Rutas de marcas
app.use("/api/brands", brandRoutes);

// Rutas de información del sistema
app.use("/api/info", infoRoutes);

// Rutas de importación
app.use("/api/import", importRoutes);

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de correo
app.use("/api/email", emailRoutes);

// Rutas de cotizaciones
app.use("/api/quotations", quotationRoutes);

// =====================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// =====================================================

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  // Verificar que err existe y tiene las propiedades necesarias
  if (!err) {
    console.error('Error: Objeto de error indefinido');
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'Error desconocido'
    });
  }

  console.log('Error:', err);
  console.error('Error:', err.message || 'Error sin mensaje');
  console.error('Tipo de error:', err.name || 'Sin nombre');
  
  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError' && err.errors) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: err.errors.map(e => ({
        field: e.path || 'campo',
        message: e.message || 'Error de validación'
      }))
    });
  }

  // Error de restricción única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError' && err.errors) {
    return res.status(400).json({
      success: false,
      error: 'Error de restricción única',
      details: err.errors.map(e => ({
        field: e.path || 'campo',
        message: e.message || 'Error de restricción única'
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
    message: process.env.NODE_ENV === 'development' && err.message ? err.message : 'Algo salió mal'
  });
};

app.use(errorHandler);

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
    message: `La ruta ${req.originalUrl} no existe`,
          availableEndpoints: {
        health: "/health",
        apiDocs: "/api-docs",
        products: "/api/products",
        productFeatures: "/api/productFeatures",
        productApplications: "/api/productApplications",
        accessories: "/api/accessories",
        relatedProducts: "/api/relatedProducts",
        categories: "/api/categories",
        brands: "/api/brands",
        info: "/api/info",
        import: "/api/import",
        auth: "/api/auth",
        email: "/api/email",
        quotations: "/api/quotations"
      }
  });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

const startServer = () => {
  const server = app.listen(config.port, () => {
    const host = server.address().address;
    const port = server.address().port;
    
    console.log('\n🚀 Servidor AIMEC Backend iniciado exitosamente!');
    console.log('================================================');
    console.log(`📍 Puerto: ${port}`);
    console.log(`🌐 IP: ${host === '::' ? 'localhost' : host}`);
    console.log(`🔗 URL Local: http://localhost:${port}`);
    console.log(`🔗 URL Red: http://${host === '::' ? 'localhost' : host}:${port}`);
    console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${port}/health`);
    console.log('================================================\n');
  });

  // Manejo de errores del servidor
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Error: El puerto ${config.port} ya está en uso`);
      console.error('💡 Solución: Cambia el puerto en .env o detén el proceso que lo usa');
    } else {
      console.error('❌ Error al iniciar el servidor:', error);
    }
    process.exit(1);
  });

  // Manejo de cierre graceful
  process.on('SIGTERM', () => {
    console.log('\n🔄 Cerrando servidor...');
    server.close(() => {
      console.log('✅ Servidor cerrado exitosamente');
      process.exit(0);
    });
  });

  return server;
};

// Exportar tanto la app como la función de inicio
module.exports = { app, startServer };
