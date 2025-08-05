const { sequelize } = require('./config/database');

const testModels = async () => {
  try {
    console.log('🧪 Probando importación de modelos...');
    
    // Intentar importar todos los modelos
    const models = require('./models');
    
    console.log('✅ Todos los modelos importados correctamente');
    console.log('📋 Modelos disponibles:');
    console.log('  - User:', !!models.User);
    console.log('  - Brand:', !!models.Brand);
    console.log('  - Category:', !!models.Category);
    console.log('  - Subcategory:', !!models.Subcategory);
    console.log('  - ProductSeries:', !!models.ProductSeries);
    console.log('  - Product:', !!models.Product);
    console.log('  - SpecificationType:', !!models.SpecificationType);
    console.log('  - Feature:', !!models.Feature);
    console.log('  - Certification:', !!models.Certification);
    console.log('  - Application:', !!models.Application);
    console.log('  - ProductSpecification:', !!models.ProductSpecification);
    console.log('  - ProductFeature:', !!models.ProductFeature);
    console.log('  - ProductCertification:', !!models.ProductCertification);
    console.log('  - ProductApplication:', !!models.ProductApplication);
    console.log('  - ProductRelated:', !!models.ProductRelated);
    
    console.log('\n🔗 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    console.log('\n📊 Probando sincronización de modelos...');
    await sequelize.sync({ force: false });
    console.log('✅ Sincronización exitosa');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
};

if (require.main === module) {
  testModels().then((success) => {
    if (success) {
      console.log('\n🎉 Todas las pruebas pasaron exitosamente!');
      process.exit(0);
    } else {
      console.log('\n💥 Algunas pruebas fallaron');
      process.exit(1);
    }
  }).catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { testModels }; 