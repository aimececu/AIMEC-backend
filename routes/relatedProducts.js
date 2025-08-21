const express = require('express');
const router = express.Router();
const { 
  getRelatedProductsByProduct, 
  createRelatedProduct, 
  createMultipleRelatedProducts,
  updateRelatedProduct,
  deleteRelatedProduct
} = require('../controllers/relatedProducts');
const { verifySession, requireAdmin } = require('../controllers/auth');

/**
 * @swagger
 * tags:
 *   - name: Productos Relacionados
 *     description: Gestión de relaciones entre productos principales y productos relacionados
 * 
 * @swagger
 * components:
 *   schemas:
 *     RelatedProduct:
 *       type: object
 *       description: Relación entre un producto principal y un producto relacionado
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la relación
 *           example: 1
 *         product_id:
 *           type: integer
 *           description: ID del producto principal
 *           example: 1
 *         related_product_id:
 *           type: integer
 *           description: ID del producto relacionado
 *           example: 5
 *         relationship_type:
 *           type: string
 *           description: Tipo de relación entre los productos
 *           example: "complementary"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la relación
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     RelatedProductInput:
 *       type: object
 *       required:
 *         - product_id
 *         - related_product_id
 *         - relationship_type
 *       properties:
 *         product_id:
 *           type: integer
 *           description: ID del producto principal
 *           example: 1
 *         related_product_id:
 *           type: integer
 *           description: ID del producto relacionado
 *           example: 5
 *         relationship_type:
 *           type: string
 *           description: Tipo de relación
 *           example: "complementary"
 *     
 *     RelatedProductUpdateInput:
 *       type: object
 *       properties:
 *         relationship_type:
 *           type: string
 *           description: Nuevo tipo de relación
 *           example: "alternative"
 *     
 *     RelatedProductResponse:
 *       type: object
 *       properties:
 *         mainProduct:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             sku:
 *               type: string
 *               example: "PROD-001"
 *             name:
 *               type: string
 *               example: "Producto Principal"
 *         relatedProducts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               relationshipType:
 *                 type: string
 *                 example: "complementary"
 *               relatedProduct:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 5
 *                   sku:
 *                     type: string
 *                     example: "PROD-005"
 *                   name:
 *                     type: string
 *                     example: "Producto Relacionado"
 *                   description:
 *                     type: string
 *                     example: "Descripción del producto relacionado"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 99.99
 *                   main_image:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *                   is_active:
 *                     type: boolean
 *                     example: true
 *         count:
 *           type: integer
 *           example: 1
 */

// =====================================================
// RUTAS DE PRODUCTOS RELACIONADOS
// =====================================================

/**
 * @swagger
 * /api/relatedProducts/product/{productId}:
 *   get:
 *     summary: Obtener productos relacionados para un producto
 *     description: Retorna todos los productos relacionados para un producto principal específico
 *     tags: [Productos Relacionados]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto principal
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de productos relacionados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RelatedProductResponse'
 *                 count:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: ID de producto inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ID de producto válido es requerido"
 *       404:
 *         description: Producto principal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Producto principal no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get('/product/:productId', getRelatedProductsByProduct);

/**
 * @swagger
 * /api/relatedProducts:
 *   post:
 *     summary: Crear nueva relación de producto relacionado
 *     description: Crea una nueva relación entre un producto principal y un producto relacionado
 *     tags: [Productos Relacionados]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RelatedProductInput'
 *           example:
 *             product_id: 1
 *             related_product_id: 5
 *             relationship_type: "complementary"
 *     responses:
 *       201:
 *         description: Relación de producto relacionado creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Producto relacionado creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/RelatedProduct'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "product_id, related_product_id y relationship_type son requeridos"
 *       401:
 *         description: No autorizado - Sesión requerida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "No se proporcionó ID de sesión"
 *       403:
 *         description: Acceso denegado - Se requieren permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Acceso denegado. Se requieren permisos de administrador."
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Uno o ambos productos no existen"
 *       409:
 *         description: Relación ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Esta relación de producto ya existe"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.post('/', verifySession, requireAdmin, createRelatedProduct);

/**
 * @swagger
 * /api/relatedProducts/multiple:
 *   post:
 *     summary: Crear múltiples productos relacionados
 *     description: Crea múltiples productos relacionados con el mismo tipo de relación
 *     tags: [Productos Relacionados]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - relationship_type
 *               - products
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: ID del producto principal
 *                 example: 1
 *               relationship_type:
 *                 type: string
 *                 description: Tipo de relación para todos los productos
 *                 example: "complementary"
 *               products:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs de productos a relacionar
 *                 example: [5, 8, 12]
 *           example:
 *             product_id: 1
 *             relationship_type: "complementary"
 *             products: [5, 8, 12]
 *     responses:
 *       201:
 *         description: Productos relacionados creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "3 productos relacionados creados exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                       description: Número de productos creados exitosamente
 *                       example: 3
 *                     skipped:
 *                       type: integer
 *                       description: Número de productos omitidos (ya existían)
 *                       example: 0
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de errores encontrados
 *                       example: []
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "product_id, relationship_type y products (array no vacío) son requeridos"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No autorizado. Inicia sesión para continuar."
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Acceso denegado. Se requieren permisos de administrador."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.post('/multiple', verifySession, requireAdmin, createMultipleRelatedProducts);

/**
 * @swagger
 * /api/relatedProducts/{id}:
 *   put:
 *     summary: Actualizar relación de producto relacionado
 *     description: Actualiza una relación de producto relacionado específica por su ID
 *     tags: [Productos Relacionados]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación de producto relacionado a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RelatedProductUpdateInput'
 *           example:
 *             relationship_type: "alternative"
 *     responses:
 *       200:
 *         description: Relación de producto relacionado actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Producto relacionado actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/RelatedProduct'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "relationship_type es requerido"
 *       401:
 *         description: No autorizado - Sesión requerida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "No se proporcionó ID de sesión"
 *       403:
 *         description: Acceso denegado - Se requieren permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Acceso denegado. Se requieren permisos de administrador."
 *       404:
 *         description: Producto relacionado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Producto relacionado no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.put('/:id', verifySession, requireAdmin, updateRelatedProduct);

/**
 * @swagger
 * /api/relatedProducts/{id}:
 *   delete:
 *     summary: Eliminar relación de producto relacionado
 *     description: Elimina una relación de producto relacionado específica por su ID
 *     tags: [Productos Relacionados]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación de producto relacionado a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Relación de producto relacionado eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Producto relacionado eliminado exitosamente"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ID válido es requerido"
 *       401:
 *         description: No autorizado - Sesión requerida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "No se proporcionó ID de sesión"
 *       403:
 *         description: Acceso denegado - Se requieren permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Acceso denegado. Se requieren permisos de administrador."
 *       404:
 *         description: Producto relacionado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Producto relacionado no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.delete('/:id', verifySession, requireAdmin, deleteRelatedProduct);



module.exports = router;