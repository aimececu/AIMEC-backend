// =====================================================
// SCRIPT PARA POBLAR LA BASE DE DATOS CON DATOS BÁSICOS
// =====================================================

const { sequelize } = require('../config/database');
const { Brand, Category, Subcategory, Product, SpecificationType } = require('../models');

const populateDatabase = async () => {
  try {
    console.log('🚀 Iniciando población de la base de datos...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si ya existen datos
    const existingBrands = await Brand.count();
    if (existingBrands > 0) {
      console.log('ℹ️  Ya existen datos en la base, saltando población');
      return;
    }

    console.log('📝 Creando datos básicos...');

    // 1. Crear marcas
    console.log('🏭 Creando marcas...');
    const brands = await Brand.bulkCreate([
      { 
        name: 'Siemens', 
        description: 'Tecnología industrial alemana líder en automatización', 
        logo_url: 'https://example.com/siemens.png',
        website: 'https://www.siemens.com'
      },
      { 
        name: 'Schneider Electric', 
        description: 'Automatización y gestión de energía', 
        logo_url: 'https://example.com/schneider.png',
        website: 'https://www.schneider-electric.com'
      },
      { 
        name: 'ABB', 
        description: 'Tecnología de electrificación y automatización', 
        logo_url: 'https://example.com/abb.png',
        website: 'https://www.abb.com'
      },
      { 
        name: 'Rockwell Automation', 
        description: 'Automatización industrial y control', 
        logo_url: 'https://example.com/rockwell.png',
        website: 'https://www.rockwellautomation.com'
      }
    ]);
    console.log(`✅ ${brands.length} marcas creadas`);

    // 2. Crear categorías
    console.log('📂 Creando categorías...');
    const categories = await Category.bulkCreate([
      { 
        name: 'Automatización', 
        description: 'Sistemas de automatización industrial', 
        icon: '⚙️', 
        color: '#3B82F6', 
        sort_order: 1 
      },
      { 
        name: 'Control', 
        description: 'Sistemas de control y monitoreo', 
        icon: '🎛️', 
        color: '#10B981', 
        sort_order: 2 
      },
      { 
        name: 'Energía', 
        description: 'Soluciones de energía y distribución', 
        icon: '⚡', 
        color: '#F59E0B', 
        sort_order: 3 
      },
      { 
        name: 'Sensores', 
        description: 'Sensores y dispositivos de medición', 
        icon: '📡', 
        color: '#8B5CF6', 
        sort_order: 4 
      },
      { 
        name: 'Comunicación', 
        description: 'Sistemas de comunicación industrial', 
        icon: '🌐', 
        color: '#06B6D4', 
        sort_order: 5 
      }
    ]);
    console.log(`✅ ${categories.length} categorías creadas`);

    // 3. Crear subcategorías
    console.log('📁 Creando subcategorías...');
    const subcategories = await Subcategory.bulkCreate([
      // Automatización
      { 
        name: 'PLC', 
        description: 'Controladores lógicos programables', 
        category_id: categories[0].id, 
        sort_order: 1 
      },
      { 
        name: 'HMI', 
        description: 'Interfaces hombre-máquina', 
        category_id: categories[0].id, 
        sort_order: 2 
      },
      { 
        name: 'Drives', 
        description: 'Variadores de velocidad', 
        category_id: categories[0].id, 
        sort_order: 3 
      },
      
      // Control
      { 
        name: 'Sensores', 
        description: 'Sensores industriales', 
        category_id: categories[1].id, 
        sort_order: 1 
      },
      { 
        name: 'Actuadores', 
        description: 'Actuadores y válvulas', 
        category_id: categories[1].id, 
        sort_order: 2 
      },
      { 
        name: 'Válvulas', 
        description: 'Válvulas de control', 
        category_id: categories[1].id, 
        sort_order: 3 
      },
      
      // Energía
      { 
        name: 'Transformadores', 
        description: 'Transformadores de potencia', 
        category_id: categories[2].id, 
        sort_order: 1 
      },
      { 
        name: 'Interruptores', 
        description: 'Interruptores automáticos', 
        category_id: categories[2].id, 
        sort_order: 2 
      },
      { 
        name: 'UPS', 
        description: 'Sistemas de alimentación ininterrumpida', 
        category_id: categories[2].id, 
        sort_order: 3 
      },
      
      // Sensores
      { 
        name: 'Temperatura', 
        description: 'Sensores de temperatura', 
        category_id: categories[3].id, 
        sort_order: 1 
      },
      { 
        name: 'Presión', 
        description: 'Sensores de presión', 
        category_id: categories[3].id, 
        sort_order: 2 
      },
      { 
        name: 'Nivel', 
        description: 'Sensores de nivel', 
        category_id: categories[3].id, 
        sort_order: 3 
      },
      
      // Comunicación
      { 
        name: 'Ethernet', 
        description: 'Equipos de red industrial', 
        category_id: categories[4].id, 
        sort_order: 1 
      },
      { 
        name: 'Profibus', 
        description: 'Equipos Profibus', 
        category_id: categories[4].id, 
        sort_order: 2 
      },
      { 
        name: 'Profinet', 
        description: 'Equipos Profinet', 
        category_id: categories[4].id, 
        sort_order: 3 
      }
    ]);
    console.log(`✅ ${subcategories.length} subcategorías creadas`);

    // 4. Crear tipos de especificaciones
    console.log('📋 Creando tipos de especificaciones...');
    const specTypes = await SpecificationType.bulkCreate([
      // Especificaciones eléctricas
      { 
        name: 'voltage', 
        display_name: 'Voltaje', 
        data_type: 'number', 
        unit: 'V', 
        category_id: categories[2].id,
        sort_order: 1
      },
      { 
        name: 'current', 
        display_name: 'Corriente', 
        data_type: 'number', 
        unit: 'A', 
        category_id: categories[2].id,
        sort_order: 2
      },
      { 
        name: 'power', 
        display_name: 'Potencia', 
        data_type: 'number', 
        unit: 'kW', 
        category_id: categories[2].id,
        sort_order: 3
      },
      { 
        name: 'frequency', 
        display_name: 'Frecuencia', 
        data_type: 'number', 
        unit: 'Hz', 
        category_id: categories[2].id,
        sort_order: 4
      },
      
      // Especificaciones de sensores
      { 
        name: 'temperature_range', 
        display_name: 'Rango de Temperatura', 
        data_type: 'text', 
        unit: '°C', 
        category_id: categories[3].id,
        sort_order: 1
      },
      { 
        name: 'pressure_range', 
        display_name: 'Rango de Presión', 
        data_type: 'text', 
        unit: 'bar', 
        category_id: categories[3].id,
        sort_order: 2
      },
      { 
        name: 'accuracy', 
        display_name: 'Precisión', 
        data_type: 'text', 
        unit: '%', 
        category_id: categories[3].id,
        sort_order: 3
      },
      
      // Especificaciones de comunicación
      { 
        name: 'protocol', 
        display_name: 'Protocolo', 
        data_type: 'text', 
        unit: null, 
        category_id: categories[4].id,
        sort_order: 1
      },
      { 
        name: 'speed', 
        display_name: 'Velocidad', 
        data_type: 'text', 
        unit: 'Mbps', 
        category_id: categories[4].id,
        sort_order: 2
      },
      { 
        name: 'ports', 
        display_name: 'Puertos', 
        data_type: 'number', 
        unit: null, 
        category_id: categories[4].id,
        sort_order: 3
      }
    ]);
    console.log(`✅ ${specTypes.length} tipos de especificaciones creados`);

    // 5. Crear productos de ejemplo
    console.log('📦 Creando productos de ejemplo...');
    const products = await Product.bulkCreate([
      {
        sku: 'SIMATIC-S7-1200-BASIC',
        name: 'PLC SIMATIC S7-1200 Basic',
        description: 'Controlador lógico programable compacto para aplicaciones básicas de automatización',
        price: 250.00,
        original_price: 300.00,
        stock_quantity: 50,
        brand_id: brands[0].id,
        category_id: categories[0].id,
        subcategory_id: subcategories[0].id,
        main_image: 'https://example.com/s7-1200-basic.jpg',
        is_featured: true,
        weight: 0.5,
        dimensions: '120x100x75'
      },
      {
        sku: 'SIMATIC-S7-1200-ADVANCED',
        name: 'PLC SIMATIC S7-1200 Advanced',
        description: 'Controlador lógico programable avanzado con capacidades de comunicación',
        price: 450.00,
        original_price: 550.00,
        stock_quantity: 30,
        brand_id: brands[0].id,
        category_id: categories[0].id,
        subcategory_id: subcategories[0].id,
        main_image: 'https://example.com/s7-1200-advanced.jpg',
        is_featured: true,
        weight: 0.8,
        dimensions: '120x100x75'
      },
      {
        sku: 'KTP900-BASIC',
        name: 'Panel Táctil KTP900 Basic',
        description: 'Panel táctil de 9 pulgadas para operación HMI',
        price: 650.00,
        original_price: 750.00,
        stock_quantity: 25,
        brand_id: brands[0].id,
        category_id: categories[0].id,
        subcategory_id: subcategories[1].id,
        main_image: 'https://example.com/ktp900-basic.jpg',
        is_featured: false,
        weight: 1.2,
        dimensions: '250x180x45'
      },
      {
        sku: 'SINAMICS-V20',
        name: 'Variador SINAMICS V20',
        description: 'Variador de velocidad compacto para aplicaciones básicas',
        price: 180.00,
        original_price: 220.00,
        stock_quantity: 40,
        brand_id: brands[0].id,
        category_id: categories[0].id,
        subcategory_id: subcategories[2].id,
        main_image: 'https://example.com/sinamics-v20.jpg',
        is_featured: false,
        weight: 0.3,
        dimensions: '90x70x25'
      },
      {
        sku: 'TEMPERATURE-SENSOR-PT100',
        name: 'Sensor de Temperatura PT100',
        description: 'Sensor de temperatura de resistencia PT100 con precisión alta',
        price: 45.00,
        original_price: 55.00,
        stock_quantity: 100,
        brand_id: brands[1].id,
        category_id: categories[3].id,
        subcategory_id: subcategories[8].id,
        main_image: 'https://example.com/temp-sensor-pt100.jpg',
        is_featured: false,
        weight: 0.1,
        dimensions: '50x15x15'
      },
      {
        sku: 'PRESSURE-TRANSMITTER',
        name: 'Transmisor de Presión',
        description: 'Transmisor de presión con rango 0-10 bar',
        price: 120.00,
        original_price: 150.00,
        stock_quantity: 60,
        brand_id: brands[2].id,
        category_id: categories[3].id,
        subcategory_id: subcategories[9].id,
        main_image: 'https://example.com/pressure-transmitter.jpg',
        is_featured: false,
        weight: 0.2,
        dimensions: '80x40x30'
      },
      {
        sku: 'ETHERNET-SWITCH-8PORT',
        name: 'Switch Ethernet Industrial 8 Puertos',
        description: 'Switch Ethernet industrial con 8 puertos para redes industriales',
        price: 280.00,
        original_price: 350.00,
        stock_quantity: 35,
        brand_id: brands[3].id,
        category_id: categories[4].id,
        subcategory_id: subcategories[12].id,
        main_image: 'https://example.com/ethernet-switch.jpg',
        is_featured: false,
        weight: 0.5,
        dimensions: '150x100x30'
      }
    ]);
    console.log(`✅ ${products.length} productos creados`);

    console.log('🎉 Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${brands.length} marcas`);
    console.log(`   - ${categories.length} categorías`);
    console.log(`   - ${subcategories.length} subcategorías`);
    console.log(`   - ${specTypes.length} tipos de especificaciones`);
    console.log(`   - ${products.length} productos`);

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  populateDatabase()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { populateDatabase };
