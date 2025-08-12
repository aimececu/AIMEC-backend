const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authLimiter } = require('../config/rateLimit');
const { validateInput } = require('../config/validation');

// Esquema de validación para login
const loginSchema = {
  email: { type: 'email', required: true },
  password: { type: 'password', required: true }
};

// Esquema de validación para registro
const registerSchema = {
  name: { type: 'text', required: true, minLength: 2, maxLength: 100 },
  email: { type: 'email', required: true },
  password: { type: 'password', required: true },
  role: { type: 'text', required: false, maxLength: 20 }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             sessionId:
 *               type: string
 *               description: ID de sesión único
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [admin, user]
 *                 is_active:
 *                   type: boolean
 *                 last_login:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autenticar usuario y obtener sessionID
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@aimec.com"
 *             password: "admin123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error del servidor
 */
router.post('/login', authLimiter, validateInput(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Cerrar sesión del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       401:
 *         description: No autorizado
 */
router.post('/logout', authController.verifySession, authController.logout);

/**
 * @swagger
 * /api/auth/check-session:
 *   get:
 *     summary: Verificar estado de sesión (público)
 *     description: Verifica si hay una sesión válida sin requerir autenticación
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Estado de la sesión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 hasValidSession:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/check-session', authController.checkSessionStatus);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar autenticación
 *     description: Verifica si el usuario está autenticado y retorna información de la sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                     session:
 *                       type: object
 *                       properties:
 *                         sessionId:
 *                           type: string
 *                         expiresAt:
 *                           type: string
 *       401:
 *         description: No autenticado
 */
router.get('/verify', authController.verifySession, authController.verifyAuth);

/**
 * @swagger
 * /api/auth/renew-session:
 *   post:
 *     summary: Renovar sesión
 *     description: Renovar la sesión actual del usuario
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Sesión renovada exitosamente
 *       400:
 *         description: Session ID requerido
 *       401:
 *         description: Sesión inválida
 *       500:
 *         description: Error del servidor
 */
router.post('/renew-session', authController.verifySession, authController.renewSession);

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Obtener sesiones del usuario
 *     description: Obtener todas las sesiones activas del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Sesiones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/sessions', authController.verifySession, authController.getUserSessions);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Cerrar todas las sesiones
 *     description: Cerrar todas las sesiones activas del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Todas las sesiones cerradas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/logout-all', authController.verifySession, authController.logoutAllSessions);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuario
 *     description: Registrar un nuevo usuario (solo admin)
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 default: user
 *           example:
 *             email: "usuario@aimec.com"
 *             password: "password123"
 *             name: "Juan Pérez"
 *             role: "user"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error del servidor
 */
router.post('/register', authController.verifySession, authController.requireAdmin, authController.register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil
 *     description: Obtener información del perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/profile', authController.verifySession, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil
 *     description: Actualizar información del perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *           example:
 *             name: "Juan Pérez Actualizado"
 *             email: "juan.perez@aimec.com"
 *             password: "nuevaPassword123"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.put('/profile', authController.verifySession, authController.updateProfile);

module.exports = router; 