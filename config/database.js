const { Sequelize } = require('sequelize');
const config = require('./env');

// Configuración de Sequelize
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    schema: config.database.schema,
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    dialectOptions: {
      searchPath: config.database.schema
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    console.log(`📁 Usando esquema: ${config.database.schema}`);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para sincronizar modelos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Base de datos sincronizada');
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    return false;
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  await sequelize.close();
  console.log('🔌 Conexión a la base de datos cerrada');
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeConnection
}; 