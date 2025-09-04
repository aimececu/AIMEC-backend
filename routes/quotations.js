const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotations');
const rateLimit = require('express-rate-limit');

// Rate limiting para envío de cotizaciones
const quotationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 cotizaciones por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos de envío de cotizaciones. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     QuotationItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - price
 *       properties:
 *         productId:
 *           type: string
 *           description: ID del producto
 *           example: "123"
 *         productName:
 *           type: string
 *           description: Nombre del producto
 *           example: "Válvula de Control"
 *         quantity:
 *           type: number
 *           description: Cantidad del producto
 *           example: 2
 *         price:
 *           type: number
 *           description: Precio unitario del producto
 *           example: 150.00
 *         total:
 *           type: number
 *           description: Total del item (cantidad * precio)
 *           example: 300.00
 *     CustomerInfo:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre completo del cliente
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cliente
 *           example: "juan.perez@empresa.com"
 *         phone:
 *           type: string
 *           description: Teléfono del cliente (opcional)
 *           example: "+52 55 1234 5678"
 *         company:
 *           type: string
 *           description: Empresa del cliente (opcional)
 *           example: "Empresa ABC"
 *     QuotationRequest:
 *       type: object
 *       required:
 *         - customerInfo
 *         - items
 *         - total
 *       properties:
 *         customerInfo:
 *           $ref: '#/components/schemas/CustomerInfo'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuotationItem'
 *           description: Lista de productos en la cotización
 *         total:
 *           type: number
 *           description: Total de la cotización
 *           example: 500.00
 *         notes:
 *           type: string
 *           description: Notas adicionales (opcional)
 *           example: "Urgente, necesito entrega en 2 días"
 *     QuotationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Cotización enviada exitosamente. El cliente recibirá un email con los detalles."
 *         data:
 *           type: object
 *           properties:
 *             messageId:
 *               type: string
 *               example: "<abc123@mail.gmail.com>"
 *             customerEmail:
 *               type: string
 *               example: "juan.perez@empresa.com"
 *             total:
 *               type: number
 *               example: 500.00
 */

/**
 * @swagger
 * /api/quotations/send:
 *   post:
 *     summary: Enviar cotización por email
 *     description: Envía una cotización por correo electrónico al cliente con los productos y precios
 *     tags: [Quotations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuotationRequest'
 *     responses:
 *       200:
 *         description: Cotización enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuotationResponse'
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
 *                 error:
 *                   type: string
 *                   example: "Nombre y email del cliente son requeridos"
 *       429:
 *         description: Demasiados intentos de envío
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
 *                   example: "Demasiados intentos de envío de cotizaciones. Intenta nuevamente en 15 minutos."
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
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor. Por favor, intenta nuevamente."
 */
router.post('/send', quotationRateLimit, quotationController.sendQuotation);

module.exports = router;
