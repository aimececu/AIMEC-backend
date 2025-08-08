#!/usr/bin/env node

// =====================================================
// SCRIPT SIMPLE PARA POBLAR LA BASE DE DATOS
// =====================================================

const { populateDatabase } = require('./populate-database');

console.log('🚀 Iniciando población de la base de datos...');

populateDatabase()
  .then(() => {
    console.log('✅ Base de datos poblada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  });
