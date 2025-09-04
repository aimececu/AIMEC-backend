const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email');
const rateLimit = require('express-rate-limit');

// Rate limiting para envío de correos
const emailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 correos por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos de envío de correo. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactForm:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre completo del contacto
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del contacto
 *           example: "juan.perez@empresa.com"
 *         phone:
 *           type: string
 *           description: Teléfono del contacto (opcional)
 *           example: "+52 55 1234 5678"
 *         company:
 *           type: string
 *           description: Empresa del contacto (opcional)
 *           example: "Empresa ABC"
 *         message:
 *           type: string
 *           description: Mensaje del contacto
 *           example: "Me interesa conocer más sobre sus productos industriales"
 *     EmailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Mensaje enviado exitosamente. Te contactaremos pronto."
 *         data:
 *           type: object
 *           properties:
 *             messageId:
 *               type: string
 *               example: "<abc123@mail.gmail.com>"
 */

/**
 * @swagger
 * /api/email/contact:
 *   post:
 *     summary: Enviar correo de contacto
 *     description: Envía un correo electrónico con los datos del formulario de contacto
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactForm'
 *     responses:
 *       200:
 *         description: Correo enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailResponse'
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
 *                   example: "Nombre, email y mensaje son requeridos"
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
 *                   example: "Demasiados intentos de envío de correo. Intenta nuevamente en 15 minutos."
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
router.post('/contact', emailRateLimit, emailController.sendContactEmail);

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Enviar correo de prueba
 *     description: Envía un correo de prueba para verificar la configuración del servidor de correo (solo en desarrollo)
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Correo de prueba enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailResponse'
 *       403:
 *         description: Funcionalidad no disponible en producción
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
 *                   example: "Esta funcionalidad no está disponible en producción"
 *       500:
 *         description: Error enviando correo de prueba
 */
router.post('/test', emailController.sendTestEmail);

/**
 * @swagger
 * /api/email/status:
 *   get:
 *     summary: Verificar estado de configuración de correo
 *     description: Verifica si el servidor de correo está configurado correctamente
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Estado de configuración obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                       example: true
 *                     smtpHost:
 *                       type: string
 *                       example: "smtp.gmail.com"
 *                     smtpPort:
 *                       type: string
 *                       example: "587"
 *                     smtpUser:
 *                       type: string
 *                       example: "***@gmail.com"
 *                     contactEmail:
 *                       type: string
 *                       example: "contacto@aimec.com"
 */
router.get('/status', emailController.getEmailStatus);

module.exports = router;
