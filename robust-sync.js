const { sequelize } = require('./config/database');

const robustSync = async () => {
  try {
    console.log('🔧 Iniciando sincronización robusta...');
    
    // 1. Primero, importar todos los modelos base
    console.log('📝 Importando modelos base...');
    const { 
      User, 
      Brand, 
      Category, 
      Subcategory, 
      ProductSeries, 
      Product, 
      SpecificationType,
      Feature,
      Certification,
      Application
    } = require('./models');
    
    // 2. Luego importar modelos de relación
    console.log('📝 Importando modelos de relación...');
    const {
      ProductSpecification,
      ProductFeature,
      ProductCertification,
      ProductApplication,
      ProductRelated
    } = require('./models');
    
    console.log('✅ Todos los modelos importados correctamente');
    
    // 3. Verificar conexión
    console.log('🔗 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // 4. Sincronizar con force para recrear todo
    console.log('🔄 Sincronizando base de datos...');
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada exitosamente');
    
    // 5. Crear datos básicos
    console.log('📝 Creando datos básicos...');
    await createBasicData();
    
    console.log('🎉 Sincronización robusta completada exitosamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Error en sincronización robusta:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
};

const createBasicData = async () => {
  try {
    const { Brand, Category, Subcategory, Product } = require('./models');
    
    // Crear marca Siemens
    console.log('  📝 Creando marca Siemens...');
    const siemens = await Brand.create({
      name: 'Siemens',
      description: 'Líder mundial en tecnología industrial, automatización y digitalización',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Siemens_logo.svg/2560px-Siemens_logo.svg.png',
      website: 'https://www.siemens.com',
      country: 'Alemania'
    });
    
    // Crear categorías
    console.log('  📝 Creando categorías...');
    const categories = await Category.bulkCreate([
      {
        name: 'Automatización Industrial',
        description: 'Sistemas de automatización y control industrial',
        icon: '⚙️',
        color: '#3B82F6',
        sort_order: 1
      },
      {
        name: 'Control de Motores',
        description: 'Variadores de frecuencia y control de motores',
        icon: '🔌',
        color: '#10B981',
        sort_order: 2
      },
      {
        name: 'Interfaces HMI',
        description: 'Pantallas táctiles y interfaces de usuario',
        icon: '📱',
        color: '#F59E0B',
        sort_order: 3
      }
    ]);
    
    // Crear subcategorías
    console.log('  📝 Creando subcategorías...');
    const subcategories = await Subcategory.bulkCreate([
      {
        name: 'PLCs',
        description: 'Controladores lógicos programables',
        category_id: categories[0].id,
        sort_order: 1
      },
      {
        name: 'Variadores',
        description: 'Variadores de frecuencia',
        category_id: categories[1].id,
        sort_order: 1
      },
      {
        name: 'Pantallas Táctiles',
        description: 'Interfaces HMI táctiles',
        category_id: categories[2].id,
        sort_order: 1
      }
    ]);
    
    // Crear productos
    console.log('  📝 Creando productos...');
    const products = await Product.bulkCreate([
      {
        sku: 'S7-1200-1214C',
        name: 'PLC S7-1200 CPU 1214C',
        description: 'Controlador lógico programable compacto para aplicaciones de automatización',
        short_description: 'PLC compacto con 14 entradas/10 salidas digitales',
        price: 450.00,
        original_price: 520.00,
        stock_quantity: 25,
        brand_id: siemens.id,
        category_id: categories[0].id,
        subcategory_id: subcategories[0].id,
        main_image: 'https://www.siemens.com/content/dam/internet/siemens-com/global/mc/automation-systems/plc/plc-s7-1200/plc-s7-1200-cpu-1214c/plc-s7-1200-cpu-1214c-1.jpg',
        rating: 4.8,
        review_count: 12,
        warranty_months: 24,
        lead_time_days: 5
      },
      {
        sku: 'G120-CU240E-2',
        name: 'Variador SINAMICS G120',
        description: 'Variador de frecuencia compacto para control de motores',
        short_description: 'Variador compacto con control vectorial',
        price: 380.00,
        original_price: 420.00,
        stock_quantity: 18,
        brand_id: siemens.id,
        category_id: categories[1].id,
        subcategory_id: subcategories[1].id,
        main_image: 'https://www.siemens.com/content/dam/internet/siemens-com/global/mc/drives/sinamics-g120/sinamics-g120-cu240e-2/sinamics-g120-cu240e-2-1.jpg',
        rating: 4.6,
        review_count: 8,
        warranty_months: 18,
        lead_time_days: 7
      },
      {
        sku: 'KTP900-BASIC',
        name: 'HMI KTP900 Basic',
        description: 'Panel de operador táctil con pantalla de 9 pulgadas',
        short_description: 'HMI táctil con pantalla de alta resolución',
        price: 650.00,
        original_price: 720.00,
        stock_quantity: 12,
        brand_id: siemens.id,
        category_id: categories[2].id,
        subcategory_id: subcategories[2].id,
        main_image: 'https://www.siemens.com/content/dam/internet/siemens-com/global/mc/hmi/ktp900-basic/ktp900-basic-1.jpg',
        rating: 4.7,
        review_count: 15,
        warranty_months: 24,
        lead_time_days: 10
      }
    ]);
    
    console.log('  ✅ Datos básicos creados exitosamente');
    console.log(`  📊 Resumen: ${products.length} productos creados`);
    
  } catch (error) {
    console.error('  ❌ Error creando datos básicos:', error.message);
    throw error;
  }
};

if (require.main === module) {
  robustSync().then((success) => {
    if (success) {
      console.log('\n🎉 Sincronización completada exitosamente!');
      process.exit(0);
    } else {
      console.log('\n💥 Sincronización falló');
      process.exit(1);
    }
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { robustSync }; 