const rateLimit = require('express-rate-limit');

// Rate limiter general para toda la aplicación
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000 / 60) // minutos
  },
  standardHeaders: true, // Incluir headers de rate limit
  legacyHeaders: false, // No incluir headers legacy
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000 / 60)
    });
  }
});

// Rate limiter más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos de login
  message: {
    error: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
      retryAfter: 15
    });
  }
});

// Rate limiter para subida de archivos
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 subidas por hora
  message: {
    error: 'Demasiadas subidas de archivos, intenta de nuevo más tarde.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas subidas de archivos, intenta de nuevo más tarde.',
      retryAfter: 60
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter
};
