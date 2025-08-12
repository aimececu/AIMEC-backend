const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');

// =====================================================
// RUTAS DE MARCAS
// =====================================================

/**
 * @swagger
 * /api/brands:
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
 *                     $ref: '#/components/schemas/Brand'
 *                 count:
 *                   type: integer
 */
// Obtener todas las marcas
router.get('/', categoryController.getAllBrands);

/**
 * @swagger
 * /api/brands/{id}:
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
 *                   $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Marca no encontrada
 */
// Obtener marca por ID
router.get('/:id', categoryController.getBrandById);

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Crear nueva marca
 *     description: Crea una nueva marca en el sistema
 *     tags: [Marcas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrandInput'
 *           example:
 *             name: "Siemens"
 *             description: "Empresa alemana líder en tecnología industrial y automatización"
 *             logo_url: "https://example.com/siemens-logo.png"
 *             website: "https://www.siemens.com"
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
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Datos inválidos
 */
// Crear nueva marca
router.post('/', categoryController.createBrand);

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     summary: Actualizar marca
 *     description: Actualiza una marca existente por su ID
 *     tags: [Marcas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la marca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrandInput'
 *     responses:
 *       200:
 *         description: Marca actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Marca no encontrada
 *       400:
 *         description: Datos inválidos
 */
// Actualizar marca
router.put('/:id', categoryController.updateBrand);

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     summary: Eliminar marca
 *     description: Elimina una marca por su ID (soft delete)
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
 *         description: Marca eliminada exitosamente
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
 *         description: Marca no encontrada
 */
// Eliminar marca
router.delete('/:id', categoryController.deleteBrand);

module.exports = router;
