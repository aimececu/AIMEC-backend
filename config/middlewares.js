const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const corsMiddleware = require('./cors');
const logger = require('./logger');

// Configuración de middlewares
const setupMiddlewares = (app) => {
  // Middleware de seguridad
  app.use(helmet({
    contentSecurityPolicy: false, // Deshabilitar CSP para desarrollo
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  }));

  // Middleware CORS
  app.use(corsMiddleware);

  // Middleware de logging
  app.use(morgan('combined'));

  // Middleware para logging de rutas (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      const start = Date.now();
      
      // Interceptar el final de la respuesta
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.request(req.method, req.path, res.statusCode, duration);
      });
      
      next();
    });
  }

  // Middleware para parsing de JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Middleware para archivos estáticos
  app.use(express.static(path.join(__dirname, '..', 'public')));
};

module.exports = setupMiddlewares; 