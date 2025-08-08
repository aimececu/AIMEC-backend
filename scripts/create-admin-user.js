const { User } = require('../models');

async function createAdminUser() {
  console.log('🔧 Creando usuario administrador por defecto...\n');

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({
      where: { 
        email: 'admin@aimec.com',
        role: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('ℹ️ El usuario administrador ya existe');
      console.log('   Email:', existingAdmin.email);
      console.log('   Nombre:', existingAdmin.name);
      console.log('   Rol:', existingAdmin.role);
      return;
    }

    // Crear usuario administrador
    const adminUser = await User.create({
      email: 'admin@aimec.com',
      password: 'admin123',
      name: 'Administrador',
      role: 'admin',
      is_active: true
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('   ID:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('   Nombre:', adminUser.name);
    console.log('   Rol:', adminUser.role);
    console.log('   Activo:', adminUser.is_active);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña por defecto en producción');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  createAdminUser().catch(console.error);
}

module.exports = { createAdminUser };
