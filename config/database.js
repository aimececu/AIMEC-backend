const { Pool } = require('pg');
const config = require('./env');

// Configuración de la base de datos
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  // Configuraciones adicionales para producción
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer conexión
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para cerrar el pool de conexiones
const closePool = async () => {
  await pool.end();
  console.log('🔌 Pool de conexiones cerrado');
};

module.exports = {
  pool,
  testConnection,
  closePool
}; 