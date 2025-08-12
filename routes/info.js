const express = require('express');
const router = express.Router();
const infoController = require('../controllers/info');

/**
 * @swagger
 * /api/info/stats:
 *   get:
 *     summary: Obtener estadísticas del sistema
 *     description: Retorna estadísticas generales del sistema (total de productos, marcas, categorías)
 *     tags: [Información del Sistema]
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
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
 *                     total_products:
 *                       type: integer
 *                       description: Total de productos activos
 *                       example: 150
 *                     total_brands:
 *                       type: integer
 *                       description: Total de marcas activas
 *                       example: 25
 *                     total_categories:
 *                       type: integer
 *                       description: Total de categorías activas
 *                       example: 12
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', infoController.getSystemStats);

module.exports = router;
