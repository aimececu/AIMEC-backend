// Cargar variables de entorno desde archivo .env
require('dotenv').config();

// Configuración de variables de entorno
const config = {
  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'aimec_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  
  // Entorno
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Puerto del servidor
  port: parseInt(process.env.PORT) || 3000,
  
  // AWS
  aws: {
    region: process.env.AWS_REGION || 'us-east-2',
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