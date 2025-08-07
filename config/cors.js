const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // En desarrollo, permitir todos los orígenes
    if (process.env.NODE_ENV !== 'production') {
      console.log('CORS - Origin:', origin);
      return callback(null, true);
    }
    
    // En producción, usar configuración de variables de entorno
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
      ['https://tu-dominio.com'];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS - Origin bloqueado:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Session-ID',
    'X-Session-ID'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
};

module.exports = cors(corsOptions); 