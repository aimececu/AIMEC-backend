const app = require('./app');
const os = require('os');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3750;

// Función para obtener la IP local automáticamente
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Ignorar interfaces no IPv4 y loopback
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '0.0.0.0'; // Fallback si no se encuentra IP
};

const HOST = '0.0.0.0'; // Escuchar en todas las interfaces

app.listen(PORT, HOST, () => {
  logger.serverStart(PORT, HOST);
  logger.info('⏹️  Presiona Ctrl+C para detener el servidor');
  logger.info(`🌐 Servidor disponible en:`);
  logger.info(`   - Local: http://localhost:${PORT}`);
  logger.info(`   - Network: http://${getLocalIP()}:${PORT}`);
}); 