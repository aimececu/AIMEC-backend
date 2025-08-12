const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');

// =====================================================
// RUTAS DE SUBCATEGORÍAS
// =====================================================

/**
 * @swagger
 * /api/subcategories:
 *   get:
 *     summary: Obtener todas las subcategorías
 *     description: Retorna una lista de todas las subcategorías disponibles
 *     tags: [Subcategorías]
 *     responses:
 *       200:
 *         description: Lista de subcategorías
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
 *                     $ref: '#/components/schemas/Subcategory'
 *                 count:
 *                   type: integer
 */
// Obtener todas las subcategorías
router.get('/', categoryController.getAllSubcategories);

/**
 * @swagger
 * /api/subcategories:
 *   post:
 *     summary: Crear nueva subcategoría
 *     description: Crea una nueva subcategoría en el sistema
 *     tags: [Subcategorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la subcategoría
 *               description:
 *                 type: string
 *                 description: Descripción de la subcategoría
 *               category_id:
 *                 type: integer
 *                 description: ID de la categoría padre
 *               is_active:
 *                 type: boolean
 *                 description: Estado activo de la subcategoría
 *           example:
 *             name: "Contactores de potencia"
 *             description: "Contactores de alta potencia para motores industriales"
 *             category_id: 1
 *             is_active: true
 *     responses:
 *       201:
 *         description: Subcategoría creada exitosamente
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
 *                   $ref: '#/components/schemas/Subcategory'
 *       400:
 *         description: Datos inválidos
 */
// Crear nueva subcategoría
router.post('/', categoryController.createSubcategory);

/**
 * @swagger
 * /api/subcategories/{id}:
 *   get:
 *     summary: Obtener subcategoría por ID
 *     description: Retorna una subcategoría específica por su ID
 *     tags: [Subcategorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la subcategoría
 *     responses:
 *       200:
 *         description: Subcategoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subcategory'
 *       404:
 *         description: Subcategoría no encontrada
 */
// Obtener subcategoría por ID
router.get('/:id', categoryController.getSubcategoryById);

/**
 * @swagger
 * /api/subcategories/{id}:
 *   put:
 *     summary: Actualizar subcategoría
 *     description: Actualiza una subcategoría existente
 *     tags: [Subcategorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la subcategoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la subcategoría
 *               description:
 *                 type: string
 *                 description: Descripción de la subcategoría
 *               category_id:
 *                 type: integer
 *                 description: ID de la categoría padre
 *               is_active:
 *                 type: boolean
 *                 description: Estado activo de la subcategoría
 *     responses:
 *       200:
 *         description: Subcategoría actualizada exitosamente
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
 *                   $ref: '#/components/schemas/Subcategory'
 *       404:
 *         description: Subcategoría no encontrada
 */
// Actualizar subcategoría
router.put('/:id', categoryController.updateSubcategory);

/**
 * @swagger
 * /api/subcategories/{id}:
 *   delete:
 *     summary: Eliminar subcategoría
 *     description: Elimina una subcategoría del sistema (soft delete)
 *     tags: [Subcategorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la subcategoría
 *     responses:
 *       200:
 *         description: Subcategoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Subcategoría no encontrada
 */
// Eliminar subcategoría
router.delete('/:id', categoryController.deleteSubcategory);

module.exports = router;
