const cors = require('cors');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] 
    : [
        'http://localhost:3000', 
        'http://localhost:3750', 
        'http://localhost:5173', 
        'http://127.0.0.1:3750', 
        'http://127.0.0.1:5173',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://169.254.31.130:3750',
        'http://169.254.31.130:3000',
        'http://169.254.31.130:5173',
        'http://192.168.3.92:3332'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
};

module.exports = cors(corsOptions); 