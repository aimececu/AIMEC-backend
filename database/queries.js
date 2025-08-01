// =====================================================
// ARCHIVO DE CONSULTAS PRINCIPAL - SISTEMA DE PRODUCTOS AIMEC
// =====================================================

// Importar el índice de consultas organizadas
const queries = require('./queries/index');

// Exportar todas las consultas organizadas
module.exports = {
  // Inicialización
  initializeDatabase: queries.initializeDatabase,
  
  // Consultas de Productos
  ...queries.products,
  
  // Consultas de Categorías, Marcas y Series
  ...queries.categories,
  
  // Consultas de Especificaciones
  ...queries.specifications
}; 