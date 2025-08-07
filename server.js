const app = require('./app');
const os = require('os');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3750;

// Función para obtener la IP local automáticamente
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  
  // Priorizar interfaces comunes
  const priorityInterfaces = ['Wi-Fi', 'Ethernet', 'eth0', 'wlan0'];
  
  // Buscar en interfaces prioritarias primero
  for (const priorityName of priorityInterfaces) {
    if (interfaces[priorityName]) {
      for (const interface of interfaces[priorityName]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.address;
        }
      }
    }
  }
  
  // Buscar en todas las interfaces si no se encuentra en las prioritarias
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost'; // Fallback más amigable
};

const HOST = '0.0.0.0'; // Escuchar en todas las interfaces
const LOCAL_IP = getLocalIP(); // IP local para mostrar en logs

app.listen(PORT, HOST, () => {
  logger.serverStart(PORT, LOCAL_IP);
}); 