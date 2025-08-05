const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

// Función para forzar sincronización completa
const forceSync = async () => {
  try {
    console.log('🔄 Forzando sincronización completa de la base de datos...');
    
    // Importar todos los modelos
    require('./models');
    
    // Sincronizar con force: true (borra y recrea todas las tablas)
    await sequelize.sync({ force: true });
    
    console.log('✅ Base de datos sincronizada completamente');
    console.log('⚠️  ADVERTENCIA: Todos los datos han sido eliminados');
    
    // Crear datos completos de Siemens
    await createSiemensData();
    
    // Limpiar el hash para que se regenere
    const hashFile = path.join(__dirname, '.models-hash');
    if (fs.existsSync(hashFile)) {
      fs.unlinkSync(hashFile);
    }
    
    console.log('✅ Proceso completado');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en sincronización forzada:', error);
    process.exit(1);
  }
};

// Función para crear datos completos de Siemens
const createSiemensData = async () => {
  try {
    console.log('📝 Cargando datos básicos de Siemens...');
    
    // Importar y ejecutar el seed básico de Siemens
    const { basicSeed } = require('./basic-seed');
    const success = await basicSeed();
    
    if (success) {
      console.log('✅ Datos básicos de Siemens cargados correctamente');
    } else {
      console.log('⚠️  Error al cargar datos de Siemens, continuando...');
    }
    
  } catch (error) {
    console.error('❌ Error al cargar datos de Siemens:', error);
    console.log('⚠️  Continuando sin datos de Siemens...');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  forceSync();
}

module.exports = { forceSync }; 