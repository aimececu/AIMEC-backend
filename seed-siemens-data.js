const { sequelize } = require('./config/database');

// Función para crear datos completos de Siemens
const seedSiemensData = async () => {
  try {
    console.log('🚀 Iniciando carga de datos Siemens...');
    
    // Importar todos los modelos
    const {
      Brand, Category, Subcategory, Product, SpecificationType,
      ProductSpecification, Application, ProductApplication,
      Feature, ProductFeature, Certification, ProductCertification
    } = require('./models');
    
    // 1. Crear marca Siemens
    console.log('📝 Creando marca Siemens...');
    const siemens = await Brand.create({
      name: 'Siemens',
      description: 'Líder mundial en tecnología industrial, automatización y digitalización',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Siemens_logo.svg/2560px-Siemens_logo.svg.png',
      website: 'https://www.siemens.com',
      country: 'Alemania'
    });
    
    // 2. Crear categorías principales
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
      },
      {
        name: 'Energía y Distribución',
        description: 'Soluciones de energía y distribución eléctrica',
        icon: '⚡',
        color: '#FF6B35',
        sort_order: 3
      },
      {
        name: 'Sensores y Actuadores',
        description: 'Sensores, actuadores y dispositivos de campo',
        icon: '🔍',
        color: '#9C27B0',
        sort_order: 4
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
      },
      {
        name: 'Drives',
        description: 'Variadores de velocidad',
        category_id: categories[0].id,
        sort_order: 2
      },
      {
        name: 'Sensores',
        description: 'Sensores industriales',
        category_id: categories[3].id,
        sort_order: 1
      },
      {
        name: 'Interruptores',
        description: 'Interruptores de potencia',
        category_id: categories[2].id,
        sort_order: 1
      }
    ]);
    
    // 4. Crear tipos de especificaciones
    console.log('📝 Creando tipos de especificaciones...');
    const specTypes = await SpecificationType.bulkCreate([
      { name: 'voltage', display_name: 'Voltaje', data_type: 'number', unit: 'V' },
      { name: 'current', display_name: 'Corriente', data_type: 'number', unit: 'A' },
      { name: 'power', display_name: 'Potencia', data_type: 'number', unit: 'kW' },
      { name: 'temperature', display_name: 'Temperatura', data_type: 'number', unit: '°C' },
      { name: 'protection', display_name: 'Protección', data_type: 'text', unit: '' },
      { name: 'communication', display_name: 'Comunicación', data_type: 'text', unit: '' },
      { name: 'dimensions', display_name: 'Dimensiones', data_type: 'text', unit: 'mm' },
      { name: 'weight', display_name: 'Peso', data_type: 'number', unit: 'kg' }
    ]);
    
    // 5. Crear aplicaciones
    console.log('📝 Creando aplicaciones...');
    const applications = await Application.bulkCreate([
      { name: 'Manufactura', description: 'Aplicaciones en manufactura industrial' },
      { name: 'Procesos', description: 'Control de procesos industriales' },
      { name: 'Energía', description: 'Aplicaciones en el sector energético' },
      { name: 'Agua y Aguas Residuales', description: 'Tratamiento de agua y aguas residuales' },
      { name: 'Petróleo y Gas', description: 'Industria del petróleo y gas' },
      { name: 'Minería', description: 'Aplicaciones mineras' },
      { name: 'Alimentos y Bebidas', description: 'Industria de alimentos y bebidas' },
      { name: 'Farmacéutica', description: 'Industria farmacéutica' }
    ]);
    
    // 6. Crear características
    console.log('📝 Creando características...');
    const features = await Feature.bulkCreate([
      { name: 'Eficiencia Energética', description: 'Alta eficiencia energética' },
      { name: 'Comunicación Industrial', description: 'Protocolos de comunicación industrial' },
      { name: 'Diagnóstico Avanzado', description: 'Sistemas de diagnóstico avanzado' },
      { name: 'Modular', description: 'Diseño modular' },
      { name: 'Escalable', description: 'Sistema escalable' },
      { name: 'Certificación ATEX', description: 'Certificado para atmósferas explosivas' },
      { name: 'IP65', description: 'Protección IP65' },
      { name: 'Temperatura Extendida', description: 'Rango de temperatura extendido' }
    ]);
    
    // 7. Crear certificaciones
    console.log('📝 Creando certificaciones...');
    const certifications = await Certification.bulkCreate([
      { name: 'CE', description: 'Conformidad Europea' },
      { name: 'UL', description: 'Underwriters Laboratories' },
      { name: 'ATEX', description: 'Atmósferas Explosivas' },
      { name: 'IEC', description: 'Comisión Electrotécnica Internacional' },
      { name: 'ISO 9001', description: 'Gestión de Calidad' },
      { name: 'ISO 14001', description: 'Gestión Ambiental' }
    ]);
    
    // 8. Crear productos Siemens
    console.log('📝 Creando productos Siemens...');
    const products = await Product.bulkCreate([
      {
        sku: 'SIMATIC-S7-1200',
        name: 'PLC SIMATIC S7-1200',
        description: 'Controlador lógico programable compacto para aplicaciones de automatización básica y avanzada',
        short_description: 'PLC compacto y potente para automatización',
        price: 850.00,
        original_price: 950.00,
        cost_price: 600.00,
        stock_quantity: 25,
        min_stock_level: 5,
        warranty_months: 24,
        lead_time_days: 7,
        weight: 0.5,
        dimensions: '120 x 100 x 75',
        voltage: 24,
        power: 15,
        temperature_range: '-20°C a +60°C',
        ip_rating: 'IP20',
        material: 'Plástico ABS',
        color: 'Gris',
        country_of_origin: 'Alemania',
        compliance: 'CE, UL, IEC',
        manual_url: 'https://support.industry.siemens.com/cs/document/109479123',
        datasheet_url: 'https://cache.industry.siemens.com/dl/files/886/109479123/att_106145/v1/s7-1200_system_manual_en-US_en-US.pdf',
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
        cost_price: 900.00,
        stock_quantity: 15,
        min_stock_level: 3,
        warranty_months: 24,
        lead_time_days: 10,
        weight: 2.1,
        dimensions: '250 x 180 x 45',
        voltage: 24,
        power: 25,
        temperature_range: '0°C a +50°C',
        ip_rating: 'IP65',
        material: 'Acero inoxidable',
        color: 'Gris oscuro',
        country_of_origin: 'Alemania',
        compliance: 'CE, UL, ATEX',
        manual_url: 'https://support.industry.siemens.com/cs/document/109479123',
        datasheet_url: 'https://cache.industry.siemens.com/dl/files/886/109479123/att_106145/v1/ktp900_datasheet.pdf',
        brand_id: siemens.id,
        category_id: categories[1].id,
        subcategory_id: subcategories[1].id,
        main_image: 'https://cache.industry.siemens.com/dl/images/886/109479123/att_106145/v1/ktp900_medium.jpg',
        is_featured: true,
        is_active: true,
        rating: 4.6,
        review_count: 89
      },
      {
        sku: 'SINAMICS-G120',
        name: 'Variador SINAMICS G120',
        description: 'Variador de velocidad compacto para aplicaciones de accionamiento industrial',
        short_description: 'Variador compacto para accionamientos',
        price: 1800.00,
        original_price: 2000.00,
        cost_price: 1400.00,
        stock_quantity: 12,
        min_stock_level: 2,
        warranty_months: 36,
        lead_time_days: 14,
        weight: 3.5,
        dimensions: '200 x 150 x 120',
        voltage: 400,
        power: 5.5,
        temperature_range: '-10°C a +50°C',
        ip_rating: 'IP20',
        material: 'Metal',
        color: 'Gris',
        country_of_origin: 'Alemania',
        compliance: 'CE, UL, IEC',
        manual_url: 'https://support.industry.siemens.com/cs/document/109479123',
        datasheet_url: 'https://cache.industry.siemens.com/dl/files/886/109479123/att_106145/v1/sinamics_g120_datasheet.pdf',
        brand_id: siemens.id,
        category_id: categories[0].id,
        subcategory_id: subcategories[2].id,
        main_image: 'https://cache.industry.siemens.com/dl/images/886/109479123/att_106145/v1/sinamics_g120_medium.jpg',
        is_featured: true,
        is_active: true,
        rating: 4.7,
        review_count: 203
      }
    ]);
    
    // 9. Crear especificaciones de productos
    console.log('📝 Creando especificaciones de productos...');
    await ProductSpecification.bulkCreate([
      // S7-1200
      { product_id: products[0].id, specification_type_id: specTypes[0].id, value: '24' },
      { product_id: products[0].id, specification_type_id: specTypes[1].id, value: '0.5' },
      { product_id: products[0].id, specification_type_id: specTypes[2].id, value: '15' },
      { product_id: products[0].id, specification_type_id: specTypes[3].id, value: '-20 a +60' },
      { product_id: products[0].id, specification_type_id: specTypes[4].id, value: 'IP20' },
      { product_id: products[0].id, specification_type_id: specTypes[5].id, value: 'PROFINET, Modbus' },
      { product_id: products[0].id, specification_type_id: specTypes[6].id, value: '120 x 100 x 75' },
      { product_id: products[0].id, specification_type_id: specTypes[7].id, value: '0.5' },
      
      // KTP900
      { product_id: products[1].id, specification_type_id: specTypes[0].id, value: '24' },
      { product_id: products[1].id, specification_type_id: specTypes[1].id, value: '1.0' },
      { product_id: products[1].id, specification_type_id: specTypes[2].id, value: '25' },
      { product_id: products[1].id, specification_type_id: specTypes[3].id, value: '0 a +50' },
      { product_id: products[1].id, specification_type_id: specTypes[4].id, value: 'IP65' },
      { product_id: products[1].id, specification_type_id: specTypes[5].id, value: 'PROFINET, OPC UA' },
      { product_id: products[1].id, specification_type_id: specTypes[6].id, value: '250 x 180 x 45' },
      { product_id: products[1].id, specification_type_id: specTypes[7].id, value: '2.1' },
      
      // G120
      { product_id: products[2].id, specification_type_id: specTypes[0].id, value: '400' },
      { product_id: products[2].id, specification_type_id: specTypes[1].id, value: '12' },
      { product_id: products[2].id, specification_type_id: specTypes[2].id, value: '5.5' },
      { product_id: products[2].id, specification_type_id: specTypes[3].id, value: '-10 a +50' },
      { product_id: products[2].id, specification_type_id: specTypes[4].id, value: 'IP20' },
      { product_id: products[2].id, specification_type_id: specTypes[5].id, value: 'PROFINET, USS' },
      { product_id: products[2].id, specification_type_id: specTypes[6].id, value: '200 x 150 x 120' },
      { product_id: products[2].id, specification_type_id: specTypes[7].id, value: '3.5' }
    ]);
    
    // 10. Asociar productos con aplicaciones
    console.log('📝 Asociando productos con aplicaciones...');
    await ProductApplication.bulkCreate([
      // S7-1200 - múltiples aplicaciones
      { product_id: products[0].id, application_id: applications[0].id },
      { product_id: products[0].id, application_id: applications[1].id },
      { product_id: products[0].id, application_id: applications[6].id },
      { product_id: products[0].id, application_id: applications[7].id },
      
      // KTP900 - múltiples aplicaciones
      { product_id: products[1].id, application_id: applications[0].id },
      { product_id: products[1].id, application_id: applications[1].id },
      { product_id: products[1].id, application_id: applications[2].id },
      { product_id: products[1].id, application_id: applications[3].id },
      
      // G120 - múltiples aplicaciones
      { product_id: products[2].id, application_id: applications[0].id },
      { product_id: products[2].id, application_id: applications[1].id },
      { product_id: products[2].id, application_id: applications[4].id },
      { product_id: products[2].id, application_id: applications[5].id }
    ]);
    
    // 11. Asociar productos con características
    console.log('📝 Asociando productos con características...');
    await ProductFeature.bulkCreate([
      // S7-1200
      { product_id: products[0].id, feature_id: features[0].id },
      { product_id: products[0].id, feature_id: features[1].id },
      { product_id: products[0].id, feature_id: features[2].id },
      { product_id: products[0].id, feature_id: features[3].id },
      { product_id: products[0].id, feature_id: features[4].id },
      
      // KTP900
      { product_id: products[1].id, feature_id: features[0].id },
      { product_id: products[1].id, feature_id: features[1].id },
      { product_id: products[1].id, feature_id: features[2].id },
      { product_id: products[1].id, feature_id: features[5].id },
      { product_id: products[1].id, feature_id: features[6].id },
      
      // G120
      { product_id: products[2].id, feature_id: features[0].id },
      { product_id: products[2].id, feature_id: features[1].id },
      { product_id: products[2].id, feature_id: features[2].id },
      { product_id: products[2].id, feature_id: features[3].id },
      { product_id: products[2].id, feature_id: features[4].id }
    ]);
    
    // 12. Asociar productos con certificaciones
    console.log('📝 Asociando productos con certificaciones...');
    await ProductCertification.bulkCreate([
      // S7-1200
      { product_id: products[0].id, certification_id: certifications[0].id },
      { product_id: products[0].id, certification_id: certifications[1].id },
      { product_id: products[0].id, certification_id: certifications[3].id },
      { product_id: products[0].id, certification_id: certifications[4].id },
      
      // KTP900
      { product_id: products[1].id, certification_id: certifications[0].id },
      { product_id: products[1].id, certification_id: certifications[1].id },
      { product_id: products[1].id, certification_id: certifications[2].id },
      { product_id: products[1].id, certification_id: certifications[4].id },
      
      // G120
      { product_id: products[2].id, certification_id: certifications[0].id },
      { product_id: products[2].id, certification_id: certifications[1].id },
      { product_id: products[2].id, certification_id: certifications[3].id },
      { product_id: products[2].id, certification_id: certifications[4].id }
    ]);
    
    console.log('✅ Datos de Siemens cargados exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - 1 Marca: Siemens`);
    console.log(`   - ${categories.length} Categorías`);
    console.log(`   - ${subcategories.length} Subcategorías`);
    console.log(`   - ${products.length} Productos`);
    console.log(`   - ${applications.length} Aplicaciones`);
    console.log(`   - ${features.length} Características`);
    console.log(`   - ${certifications.length} Certificaciones`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al cargar datos de Siemens:', error);
    return false;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedSiemensData().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { seedSiemensData }; 