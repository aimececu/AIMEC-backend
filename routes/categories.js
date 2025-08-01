const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');

// =====================================================
// RUTAS DE CATEGORÍAS
// =====================================================

// Obtener todas las categorías
router.get('/', categoryController.getAllCategories);

// Obtener categoría por ID
router.get('/:id', categoryController.getCategoryById);

// Crear nueva categoría
router.post('/', categoryController.createCategory);

// Actualizar categoría
router.put('/:id', categoryController.updateCategory);

// Eliminar categoría
router.delete('/:id', categoryController.deleteCategory);

// =====================================================
// RUTAS DE SUBCATEGORÍAS
// =====================================================

// Obtener subcategorías por categoría
router.get('/:categoryId/subcategories', categoryController.getSubcategoriesByCategory);

// Obtener subcategoría por ID
router.get('/subcategories/:id', categoryController.getSubcategoryById);

// Crear nueva subcategoría
router.post('/subcategories', categoryController.createSubcategory);

// Actualizar subcategoría
router.put('/subcategories/:id', categoryController.updateSubcategory);

// Eliminar subcategoría
router.delete('/subcategories/:id', categoryController.deleteSubcategory);

// =====================================================
// RUTAS DE MARCAS
// =====================================================

// Obtener todas las marcas
router.get('/brands', categoryController.getAllBrands);

// Obtener marca por ID
router.get('/brands/:id', categoryController.getBrandById);

// Crear nueva marca
router.post('/brands', categoryController.createBrand);

// Actualizar marca
router.put('/brands/:id', categoryController.updateBrand);

// Eliminar marca
router.delete('/brands/:id', categoryController.deleteBrand);

// =====================================================
// RUTAS DE SERIES DE PRODUCTOS
// =====================================================

// Obtener series de productos
router.get('/series', categoryController.getProductSeries);

// Obtener serie por ID
router.get('/series/:id', categoryController.getProductSeriesById);

// Crear nueva serie
router.post('/series', categoryController.createProductSeries);

// Actualizar serie
router.put('/series/:id', categoryController.updateProductSeries);

// Eliminar serie
router.delete('/series/:id', categoryController.deleteProductSeries);

module.exports = router; 