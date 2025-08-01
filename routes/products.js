const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');

// =====================================================
// RUTAS DE PRODUCTOS
// =====================================================

// Obtener todos los productos (con filtros opcionales)
router.get('/', productController.getAllProducts);

// Buscar productos
router.get('/search', productController.searchProducts);

// Obtener productos destacados
router.get('/featured', productController.getFeaturedProducts);

// Obtener estadísticas de productos
router.get('/stats', productController.getProductStats);

// Filtrar productos por especificación
router.get('/filter/specification', productController.getProductsBySpecification);

// Obtener productos por categoría
router.get('/category/:categoryId', productController.getProductsByCategory);

// Obtener productos por marca
router.get('/brand/:brandId', productController.getProductsByBrand);

// Obtener producto por ID
router.get('/:id', productController.getProductById);

// Obtener producto por slug
router.get('/slug/:slug', productController.getProductBySlug);

// Crear nuevo producto
router.post('/', productController.createProduct);

// Actualizar producto
router.put('/:id', productController.updateProduct);

// Eliminar producto (soft delete)
router.delete('/:id', productController.deleteProduct);

module.exports = router; 