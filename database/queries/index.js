// =====================================================
// ÍNDICE DE CONSULTAS - SISTEMA DE PRODUCTOS AIMEC
// =====================================================

// Importar módulos de consultas
const productQueries = require('./products');
const categoryQueries = require('./categories');
const specificationQueries = require('./specifications');

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, '../init.sql'), 'utf8');
    const { pool } = require('../../config/database');
    await pool.query(sql);
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    throw error;
  }
};

// Exportar todas las consultas organizadas por módulos
module.exports = {
  // Inicialización
  initializeDatabase,
  
  // Consultas de Productos
  products: {
    ...productQueries
  },
  
  // Consultas de Categorías, Marcas y Series
  categories: {
    ...categoryQueries
  },
  
  // Consultas de Especificaciones
  specifications: {
    ...specificationQueries
  }
}; 