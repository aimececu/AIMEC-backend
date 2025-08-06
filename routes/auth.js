const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

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
router.post('/login', authController.login);

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
 * /auth/verify:
 *   get:
 *     summary: Verificar autenticación
 *     description: Verificar si la sesión es válida y obtener información del usuario
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Sesión válida
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
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     last_login:
 *                       type: string
 *       401:
 *         description: Sesión inválida
 */
router.get('/verify', authController.verifySession, authController.verifyAuth);

/**
 * @swagger
 * /api/auth/register-initial:
 *   post:
 *     summary: Registrar primer administrador
 *     description: Crear el primer usuario administrador del sistema (solo funciona si no hay usuarios)
 *     tags: [Autenticación]
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
 *                 description: Email del administrador
 *               password:
 *                 type: string
 *                 description: Contraseña del administrador
 *               name:
 *                 type: string
 *                 description: Nombre del administrador
 *     responses:
 *       201:
 *         description: Administrador creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Ya existe un usuario en el sistema
 *       500:
 *         description: Error del servidor
 */
router.post('/register-initial', authController.registerInitial);

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