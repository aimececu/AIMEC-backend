const express = require('express');
const router = express.Router();
const specificationController = require('../controllers/specifications');

// =====================================================
// RUTAS DE ESPECIFICACIONES
// =====================================================

/**
 * @swagger
 * /api/specifications/types:
 *   get:
 *     summary: Obtener tipos de especificaciones
 *     description: Retorna una lista de todos los tipos de especificaciones disponibles
 *     tags: [Especificaciones]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: data_type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de dato
 *     responses:
 *       200:
 *         description: Lista de tipos de especificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       display_name:
 *                         type: string
 *                       data_type:
 *                         type: string
 *                       category_id:
 *                         type: integer
 *                 count:
 *                   type: integer
 */
// Obtener tipos de especificaciones
router.get('/types', specificationController.getSpecificationTypes);

// Obtener especificaciones completas de un producto (debe ir antes que la ruta más general)
router.get('/products/:productId/complete', specificationController.getProductSpecificationsComplete);

/**
 * @swagger
 * /api/specifications/products/{productId}:
 *   get:
 *     summary: Obtener especificaciones de un producto
 *     description: Retorna las especificaciones de un producto específico
 *     tags: [Especificaciones]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Especificaciones del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Specification'
 *                 count:
 *                   type: integer
 *                 productId:
 *                   type: integer
 *       404:
 *         description: Producto no encontrado
 */
// Obtener especificaciones de un producto
router.get('/products/:productId', specificationController.getProductSpecifications);

/**
 * @swagger
 * /api/specifications/{id}:
 *   get:
 *     summary: Obtener especificación por ID
 *     description: Retorna una especificación específica por su ID
 *     tags: [Especificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especificación
 *     responses:
 *       200:
 *         description: Especificación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Specification'
 *       404:
 *         description: Especificación no encontrada
 */
// Obtener especificación por ID (debe ir al final para evitar conflictos)
router.get('/:id', specificationController.getProductSpecificationById);

/**
 * @swagger
 * /api/specifications/products:
 *   post:
 *     summary: Crear especificación para un producto
 *     description: Crea una nueva especificación para un producto
 *     tags: [Especificaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - specification_type_id
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: ID del producto
 *               specification_type_id:
 *                 type: integer
 *                 description: ID del tipo de especificación
 *               value:
 *                 type: string
 *                 description: Valor de la especificación
 *               unit:
 *                 type: string
 *                 description: Unidad de medida (opcional)
 *     responses:
 *       201:
 *         description: Especificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Specification'
 *       400:
 *         description: Datos inválidos
 */
// Crear especificación para un producto
router.post('/products', specificationController.createProductSpecification);

/**
 * @swagger
 * /api/specifications/products/multiple:
 *   post:
 *     summary: Crear múltiples especificaciones para un producto
 *     description: Crea múltiples especificaciones para un producto en una sola operación
 *     tags: [Especificaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - specifications
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID del producto
 *               specifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - specification_type_id
 *                   properties:
 *                     specification_type_id:
 *                       type: integer
 *                       description: ID del tipo de especificación
 *                     value:
 *                       type: string
 *                       description: Valor de la especificación
 *                     unit:
 *                       type: string
 *                       description: Unidad de medida (opcional)
 *     responses:
 *       201:
 *         description: Especificaciones creadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Specification'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Datos inválidos
 */
// Crear múltiples especificaciones para un producto
router.post('/products/multiple', specificationController.createMultipleProductSpecifications);

/**
 * @swagger
 * /api/specifications/{id}:
 *   put:
 *     summary: Actualizar especificación
 *     description: Actualiza una especificación existente
 *     tags: [Especificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: Nuevo valor de la especificación
 *               unit:
 *                 type: string
 *                 description: Nueva unidad de medida
 *     responses:
 *       200:
 *         description: Especificación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Specification'
 *       404:
 *         description: Especificación no encontrada
 *   delete:
 *     summary: Eliminar especificación
 *     description: Elimina una especificación del sistema
 *     tags: [Especificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la especificación
 *     responses:
 *       200:
 *         description: Especificación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Specification'
 *       404:
 *         description: Especificación no encontrada
 */
// Actualizar especificación
router.put('/:id', specificationController.updateProductSpecification);

// Eliminar especificación
router.delete('/:id', specificationController.deleteProductSpecification);

/**
 * @swagger
 * /api/specifications/filter/products:
 *   get:
 *     summary: Filtrar productos por especificación
 *     description: Filtra productos basándose en especificaciones específicas
 *     tags: [Especificaciones]
 *     parameters:
 *       - in: query
 *         name: specificationTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de especificación
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Valor de la especificación
 *       - in: query
 *         name: dataType
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de dato de la especificación
 *     responses:
 *       200:
 *         description: Productos filtrados por especificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Parámetros inválidos
 */
// Filtrar productos por especificación
router.get('/filter/products', specificationController.getProductsBySpecification);

module.exports = router; 