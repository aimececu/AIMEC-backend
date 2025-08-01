const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Configurar el esquema en cada conexión
pool.on('connect', async (client) => {
  try {
    await client.query('SET search_path TO aimec_products, public');
  } catch (error) {
    console.warn('⚠️  No se pudo establecer el esquema:', error.message);
  }
});

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando base de datos...');
    
    // Verificar conexión
    const result = await client.query('SELECT current_database(), current_schema()');
    console.log('✅ Conectado a:', result.rows[0].current_database);
    console.log('📁 Esquema actual:', result.rows[0].current_schema);
    
    // Listar todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'aimec_products')
      ORDER BY table_schema, table_name
    `);
    
    // Verificar si existe el esquema aimec_products
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'aimec_products'
    `);
    
    console.log('\n📁 Esquemas disponibles:');
    if (schemaResult.rows.length > 0) {
      console.log('   ✅ Esquema aimec_products existe');
    } else {
      console.log('   ❌ Esquema aimec_products NO existe');
    }
    
    console.log('\n📊 Tablas encontradas:');
    if (tablesResult.rows.length === 0) {
      console.log('   ❌ No se encontraron tablas');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_schema}.${row.table_name}`);
      });
    }
    
    // Verificar si existe la tabla products
    const productsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      ) as exists
    `);
    
    console.log('\n🔍 Verificación de tabla products:');
    console.log(`   Existe: ${productsCheck.rows[0].exists}`);
    
    if (productsCheck.rows[0].exists) {
      // Intentar contar productos
      try {
        const countResult = await client.query('SELECT COUNT(*) FROM products');
        console.log(`   Productos en la tabla: ${countResult.rows[0].count}`);
      } catch (error) {
        console.log(`   ❌ Error al consultar productos: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    await pool.end();
  }
}

checkDatabase(); 