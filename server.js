const app = require('./app');
const os = require('os');

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

const HOST = getLocalIP();

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
  console.log(`📚 Documentación Swagger: http://${HOST}:${PORT}/api-docs`);
  console.log(`🔍 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🌐 API base: http://${HOST}:${PORT}`);
  console.log(`   http://localhost:${PORT}/api-docs`);
  console.log('');
  console.log('⏹️  Presiona Ctrl+C para detener el servidor');
}); 