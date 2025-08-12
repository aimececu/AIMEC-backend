const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');

// =====================================================
// RUTAS DE MARCAS
// =====================================================

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Retorna una lista de todas las categorías disponibles
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías
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
 *                     $ref: '#/components/schemas/Category'
 *                 count:
 *                   type: integer
 */
// Obtener todas las categorías
router.get('/', categoryController.getAllCategories);

// =====================================================
// RUTAS DE SUBCATEGORÍAS
// =====================================================

/**
 * @swagger
 * /api/categories/subcategories:
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
router.get('/subcategories', categoryController.getAllSubcategories);

/**
 * @swagger
 * /api/categories/subcategories:
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
router.post('/subcategories', categoryController.createSubcategory);

// Obtener subcategoría por ID
router.get('/subcategories/:id', categoryController.getSubcategoryById);

// Actualizar subcategoría
router.put('/subcategories/:id', categoryController.updateSubcategory);

// Eliminar subcategoría
router.delete('/subcategories/:id', categoryController.deleteSubcategory);

// Obtener subcategorías de una categoría
router.get('/:categoryId/subcategories', categoryController.getAllSubcategories);

// =====================================================
// RUTAS DE CATEGORÍAS (deben ir al final para evitar conflictos)
// =====================================================

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     description: Retorna una categoría específica por su ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoría no encontrada
 */
// Obtener categoría por ID
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear nueva categoría
 *     description: Crea una nueva categoría en el sistema
 *     tags: [Categorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *               description:
 *                 type: string
 *                 description: Descripción de la categoría
 *               icon:
 *                 type: string
 *                 description: Icono de la categoría
 *               color:
 *                 type: string
 *                 description: Color de la categoría (hex)
 *           example:
 *             name: "Contactores"
 *             description: "Dispositivos electromagnéticos para control de motores"
 *             icon: "fas fa-plug"
 *             color: "#3B82F6"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
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
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos inválidos
 */
// Crear nueva categoría
router.post('/', categoryController.createCategory);

// Actualizar categoría
router.put('/:id', categoryController.updateCategory);

// Eliminar categoría
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 