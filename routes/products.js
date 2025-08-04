const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');

// =====================================================
// RUTAS DE PRODUCTOS
// =====================================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Retorna una lista de todos los productos con opciones de filtrado
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de marca
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de productos a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Número de productos a omitir
 *     responses:
 *       200:
 *         description: Lista de productos
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
 */
// Obtener todos los productos
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Buscar productos
 *     description: Busca productos por nombre, descripción o SKU
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de resultados
 *     responses:
 *       200:
 *         description: Productos encontrados
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
 */
// Buscar productos
router.get('/search', productController.searchProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Obtener productos destacados
 *     description: Retorna una lista de productos marcados como destacados
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos destacados
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
 */
// Obtener productos destacados
router.get('/featured', productController.getFeaturedProducts);

/**
 * @swagger
 * /api/products/stats:
 *   get:
 *     summary: Obtener estadísticas de productos
 *     description: Retorna estadísticas generales de los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Estadísticas de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
// Obtener estadísticas de productos
router.get('/stats', productController.getProductStats);



/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Obtener productos por categoría
 *     description: Retorna productos de una categoría específica
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de productos
 *     responses:
 *       200:
 *         description: Productos de la categoría
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
 *                 categoryId:
 *                   type: integer
 */
// Obtener productos por categoría
router.get('/category/:categoryId', productController.getProductsByCategory);

/**
 * @swagger
 * /api/products/brand/{brandId}:
 *   get:
 *     summary: Obtener productos por marca
 *     description: Retorna productos de una marca específica
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Productos de la marca
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
 *                 brandId:
 *                   type: integer
 */
// Obtener productos por marca
router.get('/brand/:brandId', productController.getProductsByBrand);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Obtener producto por slug
 *     description: Retorna un producto específico por su slug
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
// Obtener producto por slug
router.get('/slug/:slug', productController.getProductBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Retorna un producto específico por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
// Obtener producto por ID (debe ir al final para evitar conflictos)
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     description: Crea un nuevo producto en el sistema
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - price
 *             properties:
 *               sku:
 *                 type: string
 *                 description: Código SKU del producto
 *               name:
 *                 type: string
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *               price:
 *                 type: number
 *                 description: Precio del producto
 *               brand_id:
 *                 type: integer
 *                 description: ID de la marca
 *               category_id:
 *                 type: integer
 *                 description: ID de la categoría
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
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
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 */
// Crear nuevo producto
router.post('/', productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     description: Actualiza un producto existente
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *               price:
 *                 type: number
 *                 description: Precio del producto
 *               brand_id:
 *                 type: integer
 *                 description: ID de la marca
 *               category_id:
 *                 type: integer
 *                 description: ID de la categoría
 *               is_active:
 *                 type: boolean
 *                 description: Estado activo del producto
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
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
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *   delete:
 *     summary: Eliminar producto
 *     description: Elimina un producto del sistema
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
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
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
// Actualizar producto
router.put('/:id', productController.updateProduct);

// Eliminar producto
router.delete('/:id', productController.deleteProduct);

module.exports = router; 