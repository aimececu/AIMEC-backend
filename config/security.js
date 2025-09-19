/**
 * Configuración de seguridad para evitar exposición de datos sensibles
 */

// Campos que nunca deben aparecer en logs
const SENSITIVE_FIELDS = [
  'api_key',
  'apiKey', 
  'password',
  'token',
  'secret',
  'private_key',
  'privateKey',
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'authorization',
  'auth',
  'credentials'
];

/**
 * Sanitiza un objeto para logging, ocultando campos sensibles
 * @param {any} data - Datos a sanitizar
 * @returns {any} - Datos sanitizados
 */
function sanitizeForLogging(data) {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    // Si es string, verificar si contiene datos sensibles
    if (SENSITIVE_FIELDS.some(field => data.toLowerCase().includes(field.toLowerCase()))) {
      return '***HIDDEN***';
    }
    return data;
  }
  
  if (typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '***HIDDEN***';
    } else {
      sanitized[key] = sanitizeForLogging(value);
    }
  }
  
  return sanitized;
}

/**
 * Crea un logger seguro que automáticamente sanitiza los datos
 */
function createSecureLogger(originalLogger) {
  return {
    log: (...args) => originalLogger.log(...args.map(arg => sanitizeForLogging(arg))),
    info: (...args) => originalLogger.info(...args.map(arg => sanitizeForLogging(arg))),
    warn: (...args) => originalLogger.warn(...args.map(arg => sanitizeForLogging(arg))),
    error: (...args) => originalLogger.error(...args.map(arg => sanitizeForLogging(arg))),
    debug: (...args) => originalLogger.debug(...args.map(arg => sanitizeForLogging(arg)))
  };
}

module.exports = {
  SENSITIVE_FIELDS,
  sanitizeForLogging,
  createSecureLogger
};
