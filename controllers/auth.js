// =====================================================
// CONTROLADOR DE AUTENTICACIÓN - SESSION ID BASED
// =====================================================

const User = require('../models/User');
const SessionService = require('../services/SessionService');
const bcrypt = require('bcryptjs');
const { validateEmail, validatePassword, validateText } = require('../config/validation');
const logger = require('../config/logger');

// Configuración de bcrypt
const bcryptConfig = {
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
};

// Middleware para verificar sesión (solo sessionId)
const verifySession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (!sessionId) {
      console.log('Verificación de sesión fallida: No se proporcionó sessionId');
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó ID de sesión'
      });
    }

    // Verificar sesión (incluye renovación automática de tokens internos)
    const sessionData = await SessionService.verifySession(sessionId);

    if (!sessionData) {
      console.log(`Verificación de sesión fallida: Sesión inválida o expirada - ${sessionId.substring(0, 10)}...`);
      return res.status(401).json({
        success: false,
        error: 'Sesión inválida o expirada'
      });
    }

    // Agregar información de sesión y usuario a la request
    req.sessionId = sessionData.sessionId;
    req.user = sessionData.user;
    req.session = sessionData;

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

// Función para obtener IP del cliente
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
};

// Función para obtener User Agent
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Usuario inactivo'
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

    // Obtener información del cliente
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);

    // Crear nueva sesión (solo retorna sessionId)
    const sessionData = await SessionService.createSession(user.id, ipAddress, userAgent);

    // Configurar cookie de sessionId
    res.cookie('sessionId', sessionData.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
    });

    // Respuesta exitosa (solo sessionId)
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        sessionId: sessionData.sessionId,
        expiresAt: sessionData.expiresAt,
        user: {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name,
          role: sessionData.user.role
        }
      }
    });

    logger.info(`Usuario ${user.email} inició sesión desde ${ipAddress}`);

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Logout de usuario
const logout = async (req, res) => {
  try {
    const sessionId = req.sessionId || req.headers['x-session-id'] || req.cookies?.sessionId;

    if (sessionId) {
      await SessionService.deactivateSession(sessionId);
    }

    // Limpiar cookie
    res.clearCookie('sessionId');

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

    if (req.user) {
      logger.info(`Usuario ${req.user.email} cerró sesión`);
    }

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Verificar autenticación
const verifyAuth = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role
        },
        session: {
          sessionId: req.session.sessionId,
          expiresAt: req.session.expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Error en verificación de autenticación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Verificar estado de sesión (público)
const checkSessionStatus = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (!sessionId) {
      return res.json({
        success: true,
        hasValidSession: false,
        message: 'No hay sesión activa'
      });
    }

    const sessionData = await SessionService.verifySession(sessionId);
    
    if (!sessionData) {
      return res.json({
        success: true,
        hasValidSession: false,
        message: 'Sesión expirada o inválida'
      });
    }

    return res.json({
      success: true,
      hasValidSession: true,
      message: 'Sesión válida'
    });
  } catch (error) {
    console.error('Error verificando estado de sesión:', error);
    return res.json({
      success: true,
      hasValidSession: false,
      message: 'Error verificando sesión'
    });
  }
};

// Obtener perfil del usuario
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'is_active', 'last_login', 'created_at']
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Validaciones
    if (name && !validateText(name, 2, 100)) {
      return res.status(400).json({
        success: false,
        error: 'Nombre debe tener entre 2 y 100 caracteres'
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Verificar si el email ya existe (si se está cambiando)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        });
      }
    }

    // Si se quiere cambiar la contraseña
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual es requerida para cambiar la contraseña'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual incorrecta'
        });
      }

      // Validar nueva contraseña
      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      user.password = newPassword; // Se hasheará automáticamente
    }

    // Actualizar campos
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
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

// Registrar nuevo usuario (solo admin)
const register = async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, contraseña y nombre son requeridos'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (!validateText(name, 2, 100)) {
      return res.status(400).json({
        success: false,
        error: 'Nombre debe tener entre 2 y 100 caracteres'
      });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      email,
      password,
      name,
      role,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    logger.info(`Usuario ${email} registrado por admin ${req.user.email}`);

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Renovar sesión (para compatibilidad)
const renewSession = async (req, res) => {
  try {
    const sessionId = req.sessionId || req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID requerido'
      });
    }

    const sessionData = await SessionService.renewAccessToken(sessionId);

    res.json({
      success: true,
      message: 'Sesión renovada correctamente',
      data: {
        sessionId: sessionData.sessionId,
        expiresAt: sessionData.expiresAt
      }
    });

  } catch (error) {
    console.error('Error al renovar sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener sesiones del usuario
const getUserSessions = async (req, res) => {
  try {
    const sessions = await SessionService.getUserSessions(req.user.id);

    res.json({
      success: true,
      data: sessions
    });

  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Cerrar todas las sesiones del usuario
const logoutAllSessions = async (req, res) => {
  try {
    await SessionService.deactivateAllUserSessions(req.user.id);

    // Limpiar cookie de la sesión actual
    res.clearCookie('sessionId');

    res.json({
      success: true,
      message: 'Todas las sesiones han sido cerradas'
    });

  } catch (error) {
    console.error('Error al cerrar todas las sesiones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  verifySession,
  requireAdmin,
  login,
  logout,
  verifyAuth,
  checkSessionStatus,
  getProfile,
  updateProfile,
  register,
  renewSession,
  getUserSessions,
  logoutAllSessions
}; 