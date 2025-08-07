// =====================================================
// CONTROLADOR DE AUTENTICACIÓN - JWT BASED
// =====================================================

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../config/jwt');
const { validateEmail, validatePassword, validateText } = require('../config/validation');
const logger = require('../config/logger');

// Configuración de bcrypt
const bcryptConfig = {
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
};

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

    // Validar email y contraseña usando las funciones de validación
    try {
      validateEmail(email);
      validatePassword(password);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message
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

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Actualizar último login
    await user.update({
      last_login: new Date()
    });

    // Registrar login exitoso
    logger.info(`Login exitoso para usuario: ${user.email}`);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
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
    logger.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};


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

    // Validar datos usando las funciones de validación
    try {
      validateEmail(email);
      validatePassword(password);
      validateText(name, 'Nombre', 2, 100);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message
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

    // Encriptar contraseña usando bcrypt
    const hashedPassword = await bcrypt.hash(password, bcryptConfig.saltRounds);

    // Crear usuario
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      is_active: true
    });

    // Generar token JWT para el nuevo usuario
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    // Registrar registro exitoso
    logger.info(`Nuevo usuario registrado: ${newUser.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          is_active: newUser.is_active
        }
      }
    });

  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};



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