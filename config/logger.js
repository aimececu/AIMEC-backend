// Logger simple sin dependencias externas
const colors = {
  success: (text) => `\x1b[32m${text}\x1b[0m`, // Verde
  error: (text) => `\x1b[31m${text}\x1b[0m`,   // Rojo
  warning: (text) => `\x1b[33m${text}\x1b[0m`, // Amarillo
  info: (text) => `\x1b[34m${text}\x1b[0m`,    // Azul
  debug: (text) => `\x1b[90m${text}\x1b[0m`,   // Gris
  highlight: (text) => `\x1b[36m${text}\x1b[0m`, // Cyan
  title: (text) => `\x1b[1m${text}\x1b[0m`,    // Blanco negrita
  subtitle: (text) => `\x1b[90m${text}\x1b[0m` // Gris
};

// Función para formatear timestamps
const formatTimestamp = () => {
  return new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Función para crear separadores visuales
const createSeparator = (text, char = '=') => {
  const padding = 2;
  const totalLength = 60;
  const textLength = text.length + (padding * 2);
  const sideLength = Math.floor((totalLength - textLength) / 2);
  
  return colors.subtitle(
    char.repeat(sideLength) + 
    ' ' + text + ' ' + 
    char.repeat(sideLength)
  );
};

// Logger simple y funcional
const logger = {
  // Log de inicio del servidor
  serverStart: (port, host) => {
    console.log('\n' + colors.highlight('🚀 SERVIDOR INICIADO'));
    console.log(colors.success(`✅ Servidor corriendo en http://${host}:${port}`));
    console.log(colors.info(`📚 Documentación Swagger: http://${host}:${port}/api-docs`));
    console.log(colors.info(`🔍 Health check: http://${host}:${port}/health`));
    console.log(colors.subtitle(`⏰ Iniciado el ${new Date().toLocaleDateString('es-ES')} a las ${formatTimestamp()}`));
    console.log('');
  },

  // Log de conexión a base de datos
  databaseConnected: () => {
    console.log(colors.success('✅ Conexión a base de datos establecida'));
  },

  databaseError: (error) => {
    console.log(colors.error(`❌ Error al conectar con la base de datos: ${error.message}`));
  },

  // Log de Swagger
  swaggerGenerated: (specs) => {
    console.log(colors.highlight('📚 Especificaciones de Swagger generadas:'));
    console.log(colors.info(`   • Rutas: ${Object.keys(specs.paths || {}).length}`));
    console.log(colors.info(`   • Tags: ${specs.tags?.length || 0}`));
  },

  // Log de requests HTTP
  request: (method, path, statusCode, responseTime) => {
    const methodColor = {
      GET: colors.info,
      POST: colors.success,
      PUT: colors.warning,
      DELETE: colors.error,
      PATCH: colors.highlight
    };

    const statusColor = statusCode >= 400 ? colors.error : 
                       statusCode >= 300 ? colors.warning : 
                       colors.success;

    const methodFormatted = methodColor[method] || colors.info;
    const statusFormatted = statusColor;

    console.log(
      `${colors.subtitle(formatTimestamp())} ` +
      `${methodFormatted(method.padEnd(6))} ` +
      `${colors.highlight(path.padEnd(30))} ` +
      `${statusFormatted(statusCode)} ` +
      `${colors.debug(responseTime ? `(${responseTime}ms)` : '')}`
    );
  },

  // Log de errores
  error: (message, error = null) => {
    console.log(colors.error(`❌ ${message}`));
    if (error) {
      console.log(colors.debug(`   Detalles: ${error.message}`));
    }
  },

  // Log de warnings
  warning: (message) => {
    console.log(colors.warning(`⚠️  ${message}`));
  },

  // Log de información
  info: (message) => {
    console.log(colors.info(`ℹ️  ${message}`));
  },

  // Log de éxito
  success: (message) => {
    console.log(colors.success(`✅ ${message}`));
  },

  // Log de debug
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(colors.debug(`🔍 ${message}`));
    }
  }
};

module.exports = logger; 