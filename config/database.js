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

// Configurar el esquema en cada conexión del pool
pool.on('connect', async (client) => {
  try {
    await client.query(`SET search_path TO ${config.database.schema}, public`);
  } catch (error) {
    console.warn('⚠️  No se pudo establecer el esquema en la conexión:', error.message);
  }
});

// Configurar el esquema por defecto
const setSchema = async (client) => {
  try {
    await client.query(`SET search_path TO ${config.database.schema}, public`);
  } catch (error) {
    console.warn('⚠️  No se pudo establecer el esquema:', error.message);
  }
};

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    
    // Configurar el esquema
    await setSchema(client);
    
    console.log('✅ Conexión a la base de datos establecida correctamente');
    console.log(`📁 Usando esquema: ${config.database.schema}`);
    
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