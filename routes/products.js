const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const { verifySession, requireAdmin } = require('../controllers/auth');
const { authenticateToken } = require('../config/jwt');
const { validateInput } = require('../config/validation');
const { uploadLimiter } = require('../config/rateLimit');

// Esquemas de validación
const productSchema = {
  name: { type: 'text', required: true, minLength: 2, maxLength: 200 },
  description: { type: 'text', required: false, maxLength: 1000 },
  sku: { type: 'text', required: true, minLength: 3, maxLength: 50 },
  price: { type: 'number', required: true, min: 0 },
  category_id: { type: 'number', required: true, min: 1 },
  brand_id: { type: 'number', required: false, min: 1 }
};

const productUpdateSchema = {
  name: { type: 'text', required: false, minLength: 2, maxLength: 200 },
  description: { type: 'text', required: false, maxLength: 1000 },
  sku: { type: 'text', required: false, minLength: 3, maxLength: 50 },
  price: { type: 'number', required: false, min: 0 },
  category_id: { type: 'number', required: false, min: 1 },
  brand_id: { type: 'number', required: false, min: 1 }
};

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
router.post('/', verifySession, requireAdmin, productController.createProduct);

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
router.put('/:id', verifySession, requireAdmin, productController.updateProduct);

// Eliminar producto
router.delete('/:id', verifySession, requireAdmin, productController.deleteProduct);

// =====================================================
// RUTAS DE APLICACIONES DE PRODUCTOS
// =====================================================

/**
 * @swagger
 * /api/products/{productId}/applications:
 *   get:
 *     summary: Obtener aplicaciones de un producto
 *     description: Retorna todas las aplicaciones asociadas a un producto específico
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de aplicaciones del producto
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
 *                     $ref: '#/components/schemas/Application'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:productId/applications', productController.getProductApplications);

/**
 * @swagger
 * /api/products/{productId}/applications:
 *   post:
 *     summary: Asignar aplicaciones a un producto
 *     description: Asigna una o más aplicaciones a un producto específico
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *             required:
 *               - application_ids
 *             properties:
 *               application_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs de aplicaciones a asignar
 *     responses:
 *       200:
 *         description: Aplicaciones asignadas exitosamente
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
 *                     $ref: '#/components/schemas/ProductApplication'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
router.post('/:productId/applications', verifySession, requireAdmin, productController.assignApplicationsToProduct);

// =====================================================
// RUTAS DE CARACTERÍSTICAS DE PRODUCTOS
// =====================================================

/**
 * @swagger
 * /api/products/{productId}/features:
 *   get:
 *     summary: Obtener características de un producto
 *     description: Retorna todas las características asociadas a un producto específico
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de características del producto
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
 *                     $ref: '#/components/schemas/ProductFeature'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:productId/features', productController.getProductFeatures);

/**
 * @swagger
 * /api/products/{productId}/features:
 *   post:
 *     summary: Agregar característica a un producto
 *     description: Agrega una nueva característica a un producto específico
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *             required:
 *               - feature_id
 *             properties:
 *               feature_id:
 *                 type: integer
 *                 description: ID de la característica
 *               value:
 *                 type: string
 *                 description: Valor de la característica
 *               unit:
 *                 type: string
 *                 description: Unidad de medida (opcional)
 *     responses:
 *       201:
 *         description: Característica agregada exitosamente
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
 *                   $ref: '#/components/schemas/ProductFeature'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
router.post('/:productId/features', verifySession, requireAdmin, productController.addProductFeature);

/**
 * @swagger
 * /api/products/{productId}/features/{featureId}:
 *   put:
 *     summary: Actualizar característica de un producto
 *     description: Actualiza una característica específica de un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la característica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: Nuevo valor de la característica
 *               unit:
 *                 type: string
 *                 description: Nueva unidad de medida
 *     responses:
 *       200:
 *         description: Característica actualizada exitosamente
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
 *                   $ref: '#/components/schemas/ProductFeature'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto o característica no encontrado
 */
router.put('/:productId/features/:featureId', verifySession, requireAdmin, productController.updateProductFeature);

/**
 * @swagger
 * /api/products/{productId}/features/{featureId}:
 *   delete:
 *     summary: Eliminar característica de un producto
 *     description: Elimina una característica específica de un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la característica
 *     responses:
 *       200:
 *         description: Característica eliminada exitosamente
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
 *         description: Producto o característica no encontrado
 */
router.delete('/:productId/features/:featureId', verifySession, requireAdmin, productController.deleteProductFeature);

// =====================================================
// RUTAS DE PRODUCTOS RELACIONADOS
// =====================================================

/**
 * @swagger
 * /api/products/{productId}/related:
 *   get:
 *     summary: Obtener productos relacionados
 *     description: Retorna todos los productos relacionados a un producto específico
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de productos relacionados
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
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:productId/related', productController.getProductRelated);

/**
 * @swagger
 * /api/products/{productId}/related:
 *   post:
 *     summary: Agregar producto relacionado
 *     description: Agrega un producto relacionado a un producto específico
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *             required:
 *               - related_product_id
 *             properties:
 *               related_product_id:
 *                 type: integer
 *                 description: ID del producto relacionado
 *     responses:
 *       201:
 *         description: Producto relacionado agregado exitosamente
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
 *                   $ref: '#/components/schemas/ProductRelated'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
router.post('/:productId/related', verifySession, requireAdmin, productController.addProductRelated);

/**
 * @swagger
 * /api/products/{productId}/related/{relatedId}:
 *   put:
 *     summary: Actualizar producto relacionado
 *     description: Actualiza un producto relacionado específico
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: path
 *         name: relatedId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto relacionado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               related_product_id:
 *                 type: integer
 *                 description: Nuevo ID del producto relacionado
 *     responses:
 *       200:
 *         description: Producto relacionado actualizado exitosamente
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
 *                   $ref: '#/components/schemas/ProductRelated'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto o relación no encontrado
 */
router.put('/:productId/related/:relatedId', verifySession, requireAdmin, productController.updateProductRelated);

/**
 * @swagger
 * /api/products/{productId}/related/{relatedId}:
 *   delete:
 *     summary: Eliminar producto relacionado
 *     description: Elimina un producto relacionado específico
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: path
 *         name: relatedId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto relacionado
 *     responses:
 *       200:
 *         description: Producto relacionado eliminado exitosamente
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
 *         description: Producto o relación no encontrado
 */
router.delete('/:productId/related/:relatedId', verifySession, requireAdmin, productController.deleteProductRelated);

module.exports = router; 