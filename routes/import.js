const express = require('express');
const router = express.Router();
const importController = require('../controllers/import');

/**
 * @swagger
 * /api/import/preview:
 *   post:
 *     summary: Previsualizar datos de importación
 *     description: Sube un archivo CSV/Excel y obtiene una previsualización de los datos antes de importar
 *     tags: [Importación]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo CSV o Excel a previsualizar
 *     responses:
 *       200:
 *         description: Previsualización de datos exitosa
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
 *                     preview:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sku:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           marca:
 *                             type: string
 *                           categoria:
 *                             type: string
 *                           precio:
 *                             type: number
 *                     total_rows:
 *                       type: integer
 *                     validation_errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                     can_import:
 *                       type: boolean
 *       400:
 *         description: Error en el archivo o validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/preview', importController.previewImportData);

/**
 * @swagger
 * /api/import/system:
 *   post:
 *     summary: Importar datos del sistema
 *     description: Importa productos, marcas, categorías y subcategorías desde un archivo CSV/Excel
 *     tags: [Importación]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo CSV o Excel con los datos a importar
 *     responses:
 *       200:
 *         description: Importación exitosa
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
 *                   properties:
 *                     brands_created:
 *                       type: integer
 *                       description: Número de marcas creadas
 *                     brands_existing:
 *                       type: integer
 *                       description: Número de marcas existentes
 *                     categories_created:
 *                       type: integer
 *                       description: Número de categorías creadas
 *                     categories_existing:
 *                       type: integer
 *                       description: Número de categorías existentes
 *                     subcategories_created:
 *                       type: integer
 *                       description: Número de subcategorías creadas
 *                     subcategories_existing:
 *                       type: integer
 *                       description: Número de subcategorías existentes
 *                     products_created:
 *                       type: integer
 *                       description: Número de productos creados
 *                     products_updated:
 *                       type: integer
 *                       description: Número de productos actualizados
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                           error:
 *                             type: string
 *       400:
 *         description: Error en el archivo o validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/system', importController.importSystemData);

module.exports = router;
