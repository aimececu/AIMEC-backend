const { syncDatabase } = require('../config/database');

console.log('🔄 Iniciando sincronización forzada de la base de datos...');
console.log('⚠️  Esto eliminará todas las tablas existentes y las recreará');

async function main() {
  try {
    await syncDatabase(true);
    console.log('✅ Sincronización completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

main(); 