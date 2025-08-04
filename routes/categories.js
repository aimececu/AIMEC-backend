const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');

// =====================================================
// RUTAS DE CATEGORÍAS
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
// RUTAS DE MARCAS
// =====================================================

/**
 * @swagger
 * /api/categories/brands:
 *   get:
 *     summary: Obtener todas las marcas
 *     description: Retorna una lista de todas las marcas disponibles
 *     tags: [Marcas]
 *     responses:
 *       200:
 *         description: Lista de marcas
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
 *                       description:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                 count:
 *                   type: integer
 */
// Obtener todas las marcas
router.get('/brands', categoryController.getAllBrands);

/**
 * @swagger
 * /api/categories/brands/{id}:
 *   get:
 *     summary: Obtener marca por ID
 *     description: Retorna una marca específica por su ID
 *     tags: [Marcas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Marca encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *       404:
 *         description: Marca no encontrada
 */
// Obtener marca por ID
router.get('/brands/:id', categoryController.getBrandById);

/**
 * @swagger
 * /api/categories/brands:
 *   post:
 *     summary: Crear nueva marca
 *     description: Crea una nueva marca en el sistema
 *     tags: [Marcas]
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
 *                 description: Nombre de la marca
 *               description:
 *                 type: string
 *                 description: Descripción de la marca
 *               logo_url:
 *                 type: string
 *                 description: URL del logo de la marca
 *               website:
 *                 type: string
 *                 description: Sitio web de la marca
 *     responses:
 *       201:
 *         description: Marca creada exitosamente
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
 *                   type: object
 *       400:
 *         description: Datos inválidos
 */
// Crear nueva marca
router.post('/brands', categoryController.createBrand);

// Actualizar marca
router.put('/brands/:id', categoryController.updateBrand);

// Eliminar marca
router.delete('/brands/:id', categoryController.deleteBrand);

// =====================================================
// RUTAS DE SERIES
// =====================================================

/**
 * @swagger
 * /api/categories/series:
 *   get:
 *     summary: Obtener todas las series
 *     description: Retorna una lista de todas las series de productos disponibles
 *     tags: [Series]
 *     responses:
 *       200:
 *         description: Lista de series
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
 *                       description:
 *                         type: string
 *                       brand_id:
 *                         type: integer
 *                       category_id:
 *                         type: integer
 *                       is_active:
 *                         type: boolean
 *                 count:
 *                   type: integer
 */
// Obtener todas las series
router.get('/series', categoryController.getAllSeries);

// Obtener serie por ID
router.get('/series/:id', categoryController.getProductSeriesById);

// Crear nueva serie
router.post('/series', categoryController.createProductSeries);

// Actualizar serie
router.put('/series/:id', categoryController.updateProductSeries);

// Eliminar serie
router.delete('/series/:id', categoryController.deleteProductSeries);

// =====================================================
// RUTAS DE SUBCATEGORÍAS
// =====================================================

// Obtener subcategorías de una categoría
router.get('/:categoryId/subcategories', categoryController.getSubcategoriesByCategory);

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
 *               sort_order:
 *                 type: integer
 *                 description: Orden de clasificación
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