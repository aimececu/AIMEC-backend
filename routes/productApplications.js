const express = require('express');
const router = express.Router();
const productApplicationController = require('../controllers/productApplications');
const { verifySession, requireAdmin } = require('../controllers/auth');

// =====================================================
// RUTAS DE APLICACIONES DE PRODUCTOS
// =====================================================

/**
 * @swagger
 * /api/productApplications:
 *   get:
 *     summary: Obtener todas las aplicaciones de productos
 *     tags: [ProductApplications]
 *     responses:
 *       200:
 *         description: Lista de aplicaciones
 */
router.get('/', productApplicationController.getAllApplications);

/**
 * @swagger
 * /api/productApplications/{id}:
 *   get:
 *     summary: Obtener aplicación por ID
 *     tags: [ProductApplications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aplicación encontrada
 *       404:
 *         description: Aplicación no encontrada
 */
router.get('/:id', productApplicationController.getApplicationById);

/**
 * @swagger
 * /api/productApplications:
 *   post:
 *     summary: Crear nueva aplicación
 *     tags: [ProductApplications]
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
 *               - application_text
 *             properties:
 *               product_id:
 *                 type: integer
 *               application_text:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Aplicación creada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', verifySession, requireAdmin, productApplicationController.createApplication);

/**
 * @swagger
 * /api/productApplications/{id}:
 *   put:
 *     summary: Actualizar aplicación
 *     tags: [ProductApplications]
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
 *               application_text:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Aplicación actualizada
 *       404:
 *         description: Aplicación no encontrada
 *       401:
 *         description: No autorizado
 */
router.put('/:id', verifySession, requireAdmin, productApplicationController.updateApplication);

/**
 * @swagger
 * /api/productApplications/{id}:
 *   delete:
 *     summary: Eliminar aplicación
 *     tags: [ProductApplications]
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
 *         description: Aplicación eliminada
 *       404:
 *         description: Aplicación no encontrada
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', verifySession, requireAdmin, productApplicationController.deleteApplication);

module.exports = router;
