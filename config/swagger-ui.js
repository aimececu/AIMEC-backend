const swaggerUi = require("swagger-ui-express");
const specs = require('./swagger');
const logger = require('./logger');

// Configuración de Swagger UI
const setupSwaggerUI = (app) => {
  // Endpoint para verificar las especificaciones de Swagger
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.json(specs);
  });

  // Servir la documentación Swagger con configuración simplificada
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, {
    customSiteTitle: "AIMEC API Documentation",
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      url: '/swagger.json',
      dom_id: '#swagger-ui',
      layout: 'BaseLayout',
      deepLinking: true,
      displayOperationId: false,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      defaultModelRendering: 'example',
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    }
  }));

  // Endpoint adicional para debug
  app.get('/api-docs-debug', (req, res) => {
    res.json({
      message: 'Swagger UI está configurado',
      specs: {
        paths: Object.keys(specs.paths || {}).length,
        tags: specs.tags || [],
        info: specs.info
      },
      endpoints: {
        swaggerJson: '/swagger.json',
        swaggerUI: '/api-docs'
      }
    });
  });
};

module.exports = setupSwaggerUI; 