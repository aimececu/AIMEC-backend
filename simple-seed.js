const { sequelize } = require('./config/database');

const simpleSeed = async () => {
  try {
    console.log('🚀 Iniciando carga simple de datos Siemens...');
    
    // Importar modelos
    const { Brand, Category, Subcategory, Product } = require('./models');
    
    // 1. Crear marca Siemens
    console.log('📝 Creando marca Siemens...');
    const siemens = await Brand.create({
      name: 'Siemens',
      description: 'Líder mundial en tecnología industrial',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Siemens_logo.svg/2560px-Siemens_logo.svg.png',
      website: 'https://www.siemens.com',
      country: 'Alemania'
    });
    
    // 2. Crear categorías
    console.log('📝 Creando categorías...');
    const categories = await Category.bulkCreate([
      {
        name: 'Automatización Industrial',
        description: 'Sistemas de automatización y control industrial',
        icon: '⚙️',
        color: '#0066CC',
        sort_order: 1
      },
      {
        name: 'Control y Monitoreo',
        description: 'Sistemas de control, HMI y monitoreo',
        icon: '🎛️',
        color: '#00A651',
        sort_order: 2
      }
    ]);
    
    // 3. Crear subcategorías
    console.log('📝 Creando subcategorías...');
    const subcategories = await Subcategory.bulkCreate([
      {
        name: 'PLC',
        description: 'Controladores Lógicos Programables',
        category_id: categories[0].id,
        sort_order: 1
      },
      {
        name: 'HMI',
        description: 'Interfaces Hombre-Máquina',
        category_id: categories[1].id,
        sort_order: 1
      }
    ]);
    
    // 4. Crear productos
    console.log('📝 Creando productos Siemens...');
    await Product.bulkCreate([
      {
        sku: 'SIMATIC-S7-1200',
        name: 'PLC SIMATIC S7-1200',
        description: 'Controlador lógico programable compacto para aplicaciones de automatización básica y avanzada',
        short_description: 'PLC compacto y potente para automatización',
        price: 850.00,
        original_price: 950.00,
        stock_quantity: 25,
        warranty_months: 24,
        weight: 0.5,
        dimensions: '120 x 100 x 75',
        brand_id: siemens.id,
        category_id: categories[0].id,
        subcategory_id: subcategories[0].id,
        main_image: 'https://cache.industry.siemens.com/dl/images/886/109479123/att_106145/v1/s7-1200_compact_cpu_1214c_dc-dc-dc_6es7214-1ag40-0xb0_medium.jpg',
        is_featured: true,
        is_active: true,
        rating: 4.8,
        review_count: 156
      },
      {
        sku: 'SIMATIC-HMI-KTP900',
        name: 'Panel Táctil SIMATIC HMI KTP900',
        description: 'Panel táctil de 9" para operación y visualización de procesos industriales',
        short_description: 'Panel táctil de 9" para HMI',
        price: 1200.00,
        original_price: 1350.00,
        stock_quantity: 15,
        warranty_months: 24,
        weight: 2.1,
        dimensions: '250 x 180 x 45',
        brand_id: siemens.id,
        category_id: categories[1].id,
        subcategory_id: subcategories[1].id,
        main_image: 'https://cache.industry.siemens.com/dl/images/886/109479123/att_106145/v1/ktp900_medium.jpg',
        is_featured: true,
        is_active: true,
        rating: 4.6,
        review_count: 89
      }
    ]);
    
    console.log('✅ Datos básicos de Siemens cargados exitosamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    return false;
  }
};

if (require.main === module) {
  simpleSeed().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { simpleSeed }; 