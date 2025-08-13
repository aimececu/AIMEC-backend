const express = require('express');
const router = express.Router();
const productFeatureController = require('../controllers/productFeatures');
const { verifySession, requireAdmin } = require('../controllers/auth');

// =====================================================
// RUTAS DE CARACTERÍSTICAS DE PRODUCTOS
// =====================================================

/**
 * @swagger
 * /api/productFeatures:
 *   get:
 *     summary: Obtener todas las características de productos
 *     tags: [ProductFeatures]
 *     responses:
 *       200:
 *         description: Lista de características
 */
router.get('/', productFeatureController.getAllFeatures);

/**
 * @swagger
 * /api/productFeatures/{id}:
 *   get:
 *     summary: Obtener característica por ID
 *     tags: [ProductFeatures]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Característica encontrada
 *       404:
 *         description: Característica no encontrada
 */
router.get('/:id', productFeatureController.getFeatureById);

/**
 * @swagger
 * /api/productFeatures:
 *   post:
 *     summary: Crear nueva característica
 *     tags: [ProductFeatures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - feature_text
 *             properties:
 *               product_id:
 *                 type: integer
 *               feature_text:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Característica creada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', verifySession, requireAdmin, productFeatureController.createFeature);

/**
 * @swagger
 * /api/productFeatures/{id}:
 *   put:
 *     summary: Actualizar característica
 *     tags: [ProductFeatures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feature_text:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Característica actualizada
 *       404:
 *         description: Característica no encontrada
 *       401:
 *         description: No autorizado
 */
router.put('/:id', verifySession, requireAdmin, productFeatureController.updateFeature);

/**
 * @swagger
 * /api/productFeatures/{id}:
 *   delete:
 *     summary: Eliminar característica
 *     tags: [ProductFeatures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Característica eliminada
 *       404:
 *         description: Característica no encontrada
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', verifySession, requireAdmin, productFeatureController.deleteFeature);

module.exports = router;
