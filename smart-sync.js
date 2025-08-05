const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

// Función para detectar cambios específicos en modelos
const detectModelChanges = (currentHash, savedHash) => {
  if (!savedHash) return 'first_time';
  
  // Por ahora, si hay cambios, asumimos que son cambios estructurales
  // En el futuro se puede implementar detección más granular
  return 'structural_changes';
};

// Función para sincronización inteligente mejorada
const smartSync = async () => {
  try {
    console.log('🔍 Analizando cambios en modelos...');
    
    // Importar todos los modelos
    require('./models');
    
    // Verificar si las tablas existen
    const tableExists = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'aimec_products' 
        AND table_name = 'products'
      );
    `, { type: sequelize.QueryTypes.SELECT });
    
    const tablesExist = tableExists[0]?.exists;
    
    if (!tablesExist) {
      // Primera vez: crear todas las tablas
      console.log('📝 Primera ejecución, creando todas las tablas...');
      await sequelize.sync({ force: true });
      console.log('✅ Base de datos creada completamente');
      await createSampleData();
    } else {
      // Verificar si hay datos importantes
      const dataCount = await sequelize.query(`
        SELECT 
          (SELECT COUNT(*) FROM "aimec_products"."products") as products_count,
          (SELECT COUNT(*) FROM "aimec_products"."categories") as categories_count,
          (SELECT COUNT(*) FROM "aimec_products"."brands") as brands_count
      `, { type: sequelize.QueryTypes.SELECT });
      
      const hasImportantData = dataCount[0].products_count > 0 || 
                              dataCount[0].categories_count > 0 || 
                              dataCount[0].brands_count > 0;
      
      if (hasImportantData) {
        console.log('⚠️  Detectados datos existentes en la base de datos');
        console.log('   Productos:', dataCount[0].products_count);
        console.log('   Categorías:', dataCount[0].categories_count);
        console.log('   Marcas:', dataCount[0].brands_count);
        console.log('');
        console.log('🔄 Intentando sincronización conservadora...');
        
        try {
          // Intentar alter primero
          await sequelize.sync({ alter: true });
          console.log('✅ Sincronización conservadora exitosa');
        } catch (alterError) {
          console.log('❌ Error en sincronización conservadora:', alterError.message);
          console.log('');
          console.log('🔄 Usando sincronización completa...');
          console.log('⚠️  ADVERTENCIA: Todos los datos serán eliminados');
          
          await sequelize.sync({ force: true });
          console.log('✅ Base de datos recreada completamente');
          await createSampleData();
        }
      } else {
        // No hay datos importantes, usar force sync
        console.log('🔄 No hay datos importantes, recreando tablas...');
        await sequelize.sync({ force: true });
        console.log('✅ Base de datos recreada completamente');
        await createSampleData();
      }
    }
    
    console.log('✅ Sincronización completada exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en sincronización inteligente:', error.message);
    return false;
  }
};

// Función para crear datos de ejemplo
const createSampleData = async () => {
  try {
    const { Brand, Category, Subcategory, Product, SpecificationType } = require('./models');
    
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

// Ejecutar si se llama directamente
if (require.main === module) {
  smartSync().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { smartSync }; 