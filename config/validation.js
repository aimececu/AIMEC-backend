const validator = require('validator');

// Configuración de validación
const validationConfig = {
  strict: process.env.VALIDATION_STRICT === 'true'
};

// Función para validar email
const validateEmail = (email) => {
  if (!email) {
    throw new Error('Email es requerido');
  }
  
  if (!validator.isEmail(email)) {
    throw new Error('Email inválido');
  }
  
  if (validationConfig.strict) {
    // Validaciones adicionales en modo estricto
    if (email.length > 254) {
      throw new Error('Email demasiado largo');
    }
    
    const domain = email.split('@')[1];
    if (!domain || domain.length > 253) {
      throw new Error('Dominio de email inválido');
    }
  }
  
  return true;
};

// Función para validar contraseña
const validatePassword = (password) => {
  if (!password) {
    throw new Error('Contraseña es requerida');
  }
  
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (validationConfig.strict) {
    // Validaciones adicionales en modo estricto
    if (!validator.matches(password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)) {
      throw new Error('La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial');
    }
    
    if (password.length > 128) {
      throw new Error('La contraseña es demasiado larga');
    }
  }
  
  return true;
};

// Función para validar texto
const validateText = (text, fieldName, minLength = 1, maxLength = 255) => {
  if (!text && text !== '') {
    throw new Error(`${fieldName} es requerido`);
  }
  
  if (typeof text !== 'string') {
    throw new Error(`${fieldName} debe ser una cadena de texto`);
  }
  
  if (text.length < minLength) {
    throw new Error(`${fieldName} debe tener al menos ${minLength} caracteres`);
  }
  
  if (text.length > maxLength) {
    throw new Error(`${fieldName} debe tener máximo ${maxLength} caracteres`);
  }
  
  if (validationConfig.strict) {
    // Validaciones adicionales en modo estricto
    if (validator.contains(text, '<script>') || validator.contains(text, 'javascript:')) {
      throw new Error(`${fieldName} contiene contenido no permitido`);
    }
  }
  
  return true;
};

// Función para validar URL
const validateURL = (url, fieldName = 'URL') => {
  if (!url) {
    throw new Error(`${fieldName} es requerida`);
  }
  
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'],
    require_protocol: true 
  })) {
    throw new Error(`${fieldName} inválida`);
  }
  
  if (validationConfig.strict) {
    // Validaciones adicionales en modo estricto
    if (url.length > 2048) {
      throw new Error(`${fieldName} demasiado larga`);
    }
  }
  
  return true;
};

// Función para validar número
const validateNumber = (number, fieldName, min = null, max = null) => {
  if (number === null || number === undefined) {
    throw new Error(`${fieldName} es requerido`);
  }
  
  const num = Number(number);
  if (isNaN(num)) {
    throw new Error(`${fieldName} debe ser un número válido`);
  }
  
  if (min !== null && num < min) {
    throw new Error(`${fieldName} debe ser mayor o igual a ${min}`);
  }
  
  if (max !== null && num > max) {
    throw new Error(`${fieldName} debe ser menor o igual a ${max}`);
  }
  
  return true;
};

// Función para sanitizar texto
const sanitizeText = (text) => {
  if (!text) return text;
  
  let sanitized = validator.escape(text);
  
  if (validationConfig.strict) {
    // Sanitización adicional en modo estricto
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
  }
  
  return sanitized;
};

// Middleware para validación de entrada
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const data = { ...req.body, ...req.params, ...req.query };
      
      for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        
        if (rules.required && (value === undefined || value === null || value === '')) {
          return res.status(400).json({
            success: false,
            error: `${field} es requerido`
          });
        }
        
        if (value !== undefined && value !== null && value !== '') {
          if (rules.type === 'email') {
            validateEmail(value);
          } else if (rules.type === 'password') {
            validatePassword(value);
          } else if (rules.type === 'text') {
            validateText(value, field, rules.minLength, rules.maxLength);
          } else if (rules.type === 'url') {
            validateURL(value, field);
          } else if (rules.type === 'number') {
            validateNumber(value, field, rules.min, rules.max);
          }
          
          // Sanitizar si es texto
          if (rules.type === 'text' && rules.sanitize !== false) {
            req.body[field] = sanitizeText(value);
          }
        }
      }
      
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };
};

module.exports = {
  validationConfig,
  validateEmail,
  validatePassword,
  validateText,
  validateURL,
  validateNumber,
  sanitizeText,
  validateInput
};
