// =====================================================
// CONTROLADOR DE AUTENTICACIÓN - SESSION ID BASED
// =====================================================

const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Almacén temporal de sesiones (en producción usar Redis)
const sessions = new Map();

// Middleware para verificar sesión
const verifySession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó ID de sesión'
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Sesión inválida o expirada'
      });
    }

    // Verificar si la sesión no ha expirado (24 horas)
    const now = Date.now();
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
      return res.status(401).json({
        success: false,
        error: 'Sesión expirada'
      });
    }

    // Obtener usuario actualizado
    const user = await User.findByPk(session.userId);
    if (!user || !user.is_active) {
      sessions.delete(sessionId);
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o inactivo'
      });
    }

    // Agregar información de sesión y usuario a la request
    req.sessionId = sessionId;
    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    console.error('Error en verificación de sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Middleware para requerir rol de administrador
const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};

// Función para crear sesión
const createSession = (userId) => {
  const sessionId = uuidv4();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas

  const session = {
    sessionId,
    userId,
    createdAt: Date.now(),
    expiresAt,
    lastActivity: Date.now()
  };

  sessions.set(sessionId, session);
  return sessionId;
};

// Función para limpiar sesiones expiradas
const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
    }
  }
};

// Ejecutar limpieza cada hora
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// =====================================================
// CONTROLADORES DE AUTENTICACIÓN
// =====================================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                     sessionId:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada'
      });
    }

    // Crear sesión
    const sessionId = createSession(user.id);

    // Actualizar último login
    await user.update({
      last_login: new Date()
    });

    // Configurar cookie (opcional)
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        sessionId,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          last_login: user.last_login
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
const logout = async (req, res) => {
  try {
    const sessionId = req.sessionId;
    
    if (sessionId) {
      sessions.delete(sessionId);
    }

    // Limpiar cookie
    res.clearCookie('sessionId');

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verificar sesión
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
 *                   $ref: '#/components/schemas/User'
 */
const verifyAuth = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sesión válida',
      data: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        is_active: req.user.is_active,
        last_login: req.user.last_login
      }
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     tags: [Autenticación]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        is_active: req.user.is_active,
        last_login: req.user.last_login,
        created_at: req.user.created_at,
        updated_at: req.user.updated_at
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
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
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = password;

    // Verificar si el email ya existe (si se está actualizando)
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        });
      }
    }

    // Actualizar usuario
    await req.user.update(updateData);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        is_active: req.user.is_active,
        last_login: req.user.last_login
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario (solo admin)
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
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
const register = async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, contraseña y nombre son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        is_active: newUser.is_active
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /auth/register-initial:
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
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Datos inválidos o ya existe un usuario
 *       409:
 *         description: Ya existe un usuario en el sistema
 *       500:
 *         description: Error del servidor
 */
const registerInitial = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, contraseña y nombre son requeridos'
      });
    }

    // Verificar si ya existe algún usuario en el sistema
    const userCount = await User.count();
    if (userCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un usuario en el sistema. Use /api/auth/register con autenticación de administrador.'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Crear el primer administrador
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: 'admin', // Forzar rol de administrador
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Primer administrador creado exitosamente',
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        is_active: newUser.is_active
      }
    });

  } catch (error) {
    console.error('Error en registro inicial:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login,
  logout,
  verifyAuth,
  getProfile,
  updateProfile,
  register,
  registerInitial,
  verifySession,
  requireAdmin
}; 