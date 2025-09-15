// Cargar variables de entorno desde archivo .env
require('dotenv').config();

// Configuración de variables de entorno
const config = {
  // Base de datos
  database: {
    host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || parseInt(process.env.PGPORT) || 5432,
    name: process.env.DB_NAME || process.env.PGDATABASE || 'postgres',
    user: process.env.DB_USER || process.env.PGUSER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'password',
    schema: process.env.DB_SCHEMA || 'public',
    // URL completa para Railway
    url: process.env.DATABASE_URL,
  },
  
  // Entorno
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Puerto del servidor
  port: parseInt(process.env.PORT) || 3750,
  

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Swagger
  swagger: {
    title: process.env.SWAGGER_TITLE || 'AIMEC API',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    description: process.env.SWAGGER_DESCRIPTION || 'API REST para el sistema de gestión de productos industriales AIMEC',
  },

  // Encriptación
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  // Validación
  validation: {
    strict: process.env.VALIDATION_STRICT === 'true',
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT) === 465,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    },
    contact: {
      email: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
    }
  },

  // Cloudinary (alternativa a S3)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Vercel Blob Storage (alternativa)
  vercelBlob: {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  },

  // Railway Storage (alternativa)
  railwayStorage: {
    url: process.env.RAILWAY_STORAGE_URL,
  }
};

// Validar configuración requerida
const validateConfig = () => {
  const required = ['database.host', 'database.name', 'database.user'];
  
  for (const field of required) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value) {
      throw new Error(`Variable de entorno requerida no configurada: ${field}`);
    }
  }
};

// Validar en desarrollo
if (config.nodeEnv === 'development') {
  try {
    validateConfig();
    console.log('✅ Configuración de variables de entorno válida');
  } catch (error) {
    console.warn('⚠️  Advertencia de configuración:', error.message);
  }
}

module.exports = config; 