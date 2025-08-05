const { Sequelize } = require('sequelize');
const config = require('./env');
const fs = require('fs');
const path = require('path');

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

// Función para obtener el hash de los modelos (para detectar cambios)
const getModelsHash = () => {
  const modelsDir = path.join(__dirname, '../models');
  const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .sort();
  
  let hash = '';
  modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const stats = fs.statSync(filePath);
    hash += `${file}:${stats.mtime.getTime()}`;
  });
  
  return require('crypto').createHash('md5').update(hash).digest('hex');
};

// Función para guardar el hash de los modelos
const saveModelsHash = (hash) => {
  const hashFile = path.join(__dirname, '../.models-hash');
  fs.writeFileSync(hashFile, hash);
};

// Función para obtener el hash guardado
const getSavedModelsHash = () => {
  const hashFile = path.join(__dirname, '../.models-hash');
  if (fs.existsSync(hashFile)) {
    return fs.readFileSync(hashFile, 'utf8');
  }
  return null;
};

// Función para limpiar restricciones problemáticas
const cleanConstraints = async () => {
  try {
    console.log('🧹 Limpiando restricciones problemáticas...');
    
    // Deshabilitar verificación de claves foráneas temporalmente
    await sequelize.query('SET session_replication_role = replica;');
    
    // Limpiar restricciones de subcategories si existen
    try {
      await sequelize.query(`
        ALTER TABLE "aimec_products"."subcategories" 
        DROP CONSTRAINT IF EXISTS "subcategories_category_id_fkey";
      `);
    } catch (e) {
      // Ignorar errores si la restricción no existe
    }
    
    // Rehabilitar verificación de claves foráneas
    await sequelize.query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ Restricciones limpiadas');
  } catch (error) {
    console.log('⚠️  No se pudieron limpiar restricciones:', error.message);
  }
};

// Función para sincronización inteligente
const smartSync = async () => {
  try {
    const currentHash = getModelsHash();
    const savedHash = getSavedModelsHash();
    
    // Si no hay hash guardado o ha cambiado, sincronizar
    if (!savedHash || currentHash !== savedHash) {
      console.log('🔄 Detectados cambios en los modelos, usando sincronización inteligente...');
      
      // Usar el script inteligente mejorado
      const { smartSync: improvedSmartSync } = require('../smart-sync');
      const result = await improvedSmartSync();
      
      if (result) {
        // Guardar el nuevo hash
        saveModelsHash(currentHash);
      }
      
      return result;
    } else {
      console.log('✅ Los modelos están sincronizados, no se requieren cambios');
      return true;
    }
  } catch (error) {
    console.error('❌ Error en sincronización inteligente:', error.message);
    return false;
  }
};

// Función para crear datos de ejemplo
const createSampleData = async () => {
  try {
    const { Brand, Category, Subcategory, Product, SpecificationType } = require('../models');
    
    // Verificar si ya existen datos
    const existingBrands = await Brand.count();
    if (existingBrands > 0) {
      console.log('ℹ️  Ya existen datos en la base, saltando creación de datos de ejemplo');
      return;
    }
    
    console.log('📝 Creando datos de ejemplo...');
    
    // Crear marcas de ejemplo
    const brands = await Brand.bulkCreate([
      { name: 'Siemens', description: 'Tecnología industrial alemana', logo_url: 'https://example.com/siemens.png' },
      { name: 'Schneider Electric', description: 'Automatización y energía', logo_url: 'https://example.com/schneider.png' },
      { name: 'ABB', description: 'Tecnología de electrificación', logo_url: 'https://example.com/abb.png' }
    ]);
    
    // Crear categorías de ejemplo
    const categories = await Category.bulkCreate([
      { name: 'Automatización', description: 'Sistemas de automatización industrial', icon: '⚙️', color: '#3B82F6', sort_order: 1 },
      { name: 'Control', description: 'Sistemas de control y monitoreo', icon: '🎛️', color: '#10B981', sort_order: 2 },
      { name: 'Energía', description: 'Soluciones de energía y distribución', icon: '⚡', color: '#F59E0B', sort_order: 3 }
    ]);
    
    // Crear subcategorías de ejemplo
    await Subcategory.bulkCreate([
      { name: 'PLC', description: 'Controladores lógicos programables', category_id: categories[0].id, sort_order: 1 },
      { name: 'HMI', description: 'Interfaces hombre-máquina', category_id: categories[0].id, sort_order: 2 },
      { name: 'Sensores', description: 'Sensores industriales', category_id: categories[1].id, sort_order: 1 },
      { name: 'Actuadores', description: 'Actuadores y válvulas', category_id: categories[1].id, sort_order: 2 }
    ]);
    
    // Crear tipos de especificaciones de ejemplo
    await SpecificationType.bulkCreate([
      { name: 'voltage', display_name: 'Voltaje', data_type: 'number', unit: 'V', category_id: categories[2].id },
      { name: 'current', display_name: 'Corriente', data_type: 'number', unit: 'A', category_id: categories[2].id },
      { name: 'power', display_name: 'Potencia', data_type: 'number', unit: 'kW', category_id: categories[2].id },
      { name: 'temperature', display_name: 'Temperatura', data_type: 'number', unit: '°C', category_id: categories[1].id }
    ]);
    
    // Crear productos de ejemplo
    await Product.bulkCreate([
      {
        sku: 'SIMATIC-S7-1200',
        name: 'PLC SIMATIC S7-1200',
        description: 'Controlador lógico programable compacto',
        price: 250.00,
        original_price: 300.00,
        stock_quantity: 50,
        brand_id: brands[0].id,
        category_id: categories[0].id,
        main_image: 'https://example.com/s7-1200.jpg',
        is_featured: true
      },
      {
        sku: 'TOUCH-PANEL-KTP',
        name: 'Panel Táctil KTP',
        description: 'Panel táctil para operación HMI',
        price: 450.00,
        original_price: 500.00,
        stock_quantity: 25,
        brand_id: brands[0].id,
        category_id: categories[0].id,
        main_image: 'https://example.com/ktp.jpg',
        is_featured: true
      }
    ]);
    
    console.log('✅ Datos de ejemplo creados correctamente');
    
  } catch (error) {
    console.error('❌ Error al crear datos de ejemplo:', error);
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
  smartSync,
  closeConnection
}; 