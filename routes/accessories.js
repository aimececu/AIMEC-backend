const express = require('express');
const router = express.Router();
const { 
  getAccessoriesByProduct, 
  createAccessory, 
  deleteAccessory 
} = require('../controllers/accessories');
const { verifySession, requireAdmin } = require('../controllers/auth');

/**
 * @swagger
 * tags:
 *   - name: Accesorios
 *     description: Gestión de relaciones entre productos principales y accesorios compatibles
 * 
 * @swagger
 * components:
 *   schemas:
 *     Accessory:
 *       type: object
 *       description: Relación entre un producto principal y un accesorio
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la relación
 *           example: 1
 *         main_product_id:
 *           type: integer
 *           description: ID del producto principal
 *           example: 1
 *         accessory_product_id:
 *           type: integer
 *           description: ID del producto accesorio
 *           example: 5
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
 */

// =====================================================
// RUTAS DE ACCESORIOS
// =====================================================

/**
 * @swagger
 * /api/accessories/product/{productId}:
 *   get:
 *     summary: Obtener accesorios compatibles para un producto
 *     description: Retorna todos los accesorios compatibles para un producto principal específico
 *     tags: [Accesorios]
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
 *         description: Lista de accesorios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessoryResponse'
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
router.get('/product/:productId', getAccessoriesByProduct);

/**
 * @swagger
 * /api/accessories:
 *   post:
 *     summary: Crear nueva relación de accesorio
 *     description: Crea una nueva relación entre un producto principal y un producto accesorio
 *     tags: [Accesorios]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessoryInput'
 *           example:
 *             main_product_id: 1
 *             accessory_product_id: 5
 *     responses:
 *       201:
 *         description: Relación de accesorio creada exitosamente
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
 *                   example: "Accesorio creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Accessory'
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
 *                   example: "main_product_id y accessory_product_id son requeridos"
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
 *                   example: "Esta relación de accesorio ya existe"
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
router.post('/', verifySession, requireAdmin, createAccessory);

/**
 * @swagger
 * /api/accessories/{id}:
 *   delete:
 *     summary: Eliminar relación de accesorio
 *     description: Elimina una relación de accesorio específica por su ID
 *     tags: [Accesorios]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la relación de accesorio a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Relación de accesorio eliminada exitosamente
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
 *                   example: "Accesorio eliminado exitosamente"
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
 *         description: Accesorio no encontrado
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
 *                   example: "Accesorio no encontrado"
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
router.delete('/:id', verifySession, requireAdmin, deleteAccessory);

module.exports = router;
