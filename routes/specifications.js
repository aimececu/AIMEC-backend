const express = require('express');
const router = express.Router();
const specificationController = require('../controllers/specifications');

// =====================================================
// RUTAS DE TIPOS DE ESPECIFICACIONES
// =====================================================

// Obtener tipos de especificaciones
router.get('/types', specificationController.getSpecificationTypes);

// Obtener tipo de especificación por ID
router.get('/types/:id', specificationController.getSpecificationTypeById);

// Crear nuevo tipo de especificación
router.post('/types', specificationController.createSpecificationType);

// Actualizar tipo de especificación
router.put('/types/:id', specificationController.updateSpecificationType);

// Eliminar tipo de especificación
router.delete('/types/:id', specificationController.deleteSpecificationType);

// =====================================================
// RUTAS DE ESPECIFICACIONES DE PRODUCTOS
// =====================================================

// Obtener especificaciones de un producto
router.get('/products/:productId', specificationController.getProductSpecifications);

// Obtener especificaciones completas de un producto
router.get('/products/:productId/complete', specificationController.getProductSpecificationsComplete);

// Obtener especificación específica
router.get('/:id', specificationController.getProductSpecificationById);

// Crear especificación para un producto
router.post('/products', specificationController.createProductSpecification);

// Crear múltiples especificaciones para un producto
router.post('/products/multiple', specificationController.createMultipleProductSpecifications);

// Actualizar especificación de un producto
router.put('/:id', specificationController.updateProductSpecification);

// Eliminar especificación de un producto
router.delete('/:id', specificationController.deleteProductSpecification);

// =====================================================
// RUTAS ESPECIALIZADAS
// =====================================================

// Obtener especificaciones por categoría
router.get('/category/:categoryId', specificationController.getSpecificationsByCategory);

// Filtrar productos por especificación
router.get('/filter/products', specificationController.getProductsBySpecification);

module.exports = router; 