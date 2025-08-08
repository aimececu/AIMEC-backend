const { Session, User } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class SessionService {
  constructor() {
    this.ACCESS_TOKEN_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
    this.REFRESH_TOKEN_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
  }

  // Generar un session ID único
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generar un access token JWT (corto plazo) - INTERNO
  generateAccessToken(userId, sessionId) {
    return jwt.sign(
      {
        userId,
        sessionId,
        type: 'access'
      },
      this.JWT_SECRET,
      { expiresIn: '30m' }
    );
  }

  // Generar un refresh token JWT (largo plazo) - INTERNO
  generateRefreshToken(userId, sessionId) {
    return jwt.sign(
      {
        userId,
        sessionId,
        type: 'refresh'
      },
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );
  }

  // Crear una nueva sesión
  async createSession(userId, ipAddress, userAgent) {
    try {
      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Generar session ID y tokens internos
      const sessionId = this.generateSessionId();
      const accessToken = this.generateAccessToken(userId, sessionId);
      const refreshToken = this.generateRefreshToken(userId, sessionId);

      // Calcular fecha de expiración del refresh token
      const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_DURATION);

      // Crear la sesión en base de datos
      const session = await Session.create({
        user_id: userId,
        session_id: sessionId,
        token: refreshToken, // Guardamos el refresh token en la base de datos
        access_token: accessToken, // Guardamos también el access token actual
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt,
        is_active: true
      });

      // Actualizar último login del usuario
      await user.update({ last_login: new Date() });

      // Solo retornamos el sessionId al frontend
      return {
        sessionId,
        expiresAt,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error(`Error al crear sesión: ${error.message}`);
    }
  }

  // Verificar sesión por sessionId (método principal para el frontend)
  async verifySession(sessionId) {
    try {
      const session = await Session.findOne({
        where: {
          session_id: sessionId,
          is_active: true
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'role', 'is_active']
        }]
      });

      if (!session) {
        return null;
      }

      // Verificar si la sesión ha expirado
      if (new Date() > session.expires_at) {
        await this.deactivateSession(sessionId);
        return null;
      }

      // Verificar que el usuario esté activo
      if (!session.user.is_active) {
        await this.deactivateSession(sessionId);
        return null;
      }

      // Verificar si el access token actual ha expirado
      let accessToken = session.access_token;
      try {
        jwt.verify(accessToken, this.JWT_SECRET);
      } catch (error) {
        // Access token expirado, renovar usando refresh token
        try {
          const newAccessToken = this.generateAccessToken(session.user_id, sessionId);
          
          // Actualizar access token en base de datos
          await session.update({ access_token: newAccessToken });
          
          accessToken = newAccessToken;
        } catch (refreshError) {
          // Si no se puede renovar, desactivar sesión
          await this.deactivateSession(sessionId);
          return null;
        }
      }

      return {
        sessionId: session.session_id,
        expiresAt: session.expires_at,
        user: session.user
      };
    } catch (error) {
      throw new Error(`Error al verificar sesión: ${error.message}`);
    }
  }

  // Verificar access token (método interno)
  async verifyAccessToken(accessToken) {
    try {
      const decoded = jwt.verify(accessToken, this.JWT_SECRET);

      if (!decoded.userId || !decoded.sessionId || decoded.type !== 'access') {
        return null;
      }

      // Verificar que la sesión existe y está activa
      const session = await Session.findOne({
        where: {
          session_id: decoded.sessionId,
          user_id: decoded.userId,
          is_active: true
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'role', 'is_active']
        }]
      });

      if (!session) {
        return null;
      }

      // Verificar si la sesión ha expirado
      if (new Date() > session.expires_at) {
        await this.deactivateSession(decoded.sessionId);
        return null;
      }

      return {
        sessionId: session.session_id,
        expiresAt: session.expires_at,
        user: session.user
      };
    } catch (error) {
      return null; // Token inválido o expirado
    }
  }

  // Verificar refresh token (método interno)
  async verifyRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);

      if (!decoded.userId || !decoded.sessionId || decoded.type !== 'refresh') {
        return null;
      }

      // Verificar que la sesión existe y está activa
      const session = await Session.findOne({
        where: {
          session_id: decoded.sessionId,
          user_id: decoded.userId,
          is_active: true
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'role', 'is_active']
        }]
      });

      if (!session) {
        return null;
      }

      // Verificar si la sesión ha expirado
      if (new Date() > session.expires_at) {
        await this.deactivateSession(decoded.sessionId);
        return null;
      }

      return {
        sessionId: session.session_id,
        expiresAt: session.expires_at,
        user: session.user
      };
    } catch (error) {
      return null; // Token inválido o expirado
    }
  }

  // Renovar access token internamente
  async renewAccessToken(sessionId) {
    try {
      const session = await Session.findOne({
        where: {
          session_id: sessionId,
          is_active: true
        }
      });

      if (!session) {
        throw new Error('Sesión no encontrada');
      }

      // Verificar si la sesión ha expirado
      if (new Date() > session.expires_at) {
        await this.deactivateSession(sessionId);
        throw new Error('Sesión expirada');
      }

      // Generar nuevo access token
      const newAccessToken = this.generateAccessToken(session.user_id, sessionId);

      // Actualizar access token en base de datos
      await session.update({ access_token: newAccessToken });

      return {
        sessionId,
        expiresAt: session.expires_at
      };
    } catch (error) {
      throw new Error(`Error al renovar access token: ${error.message}`);
    }
  }

  // Desactivar una sesión
  async deactivateSession(sessionId) {
    try {
      const session = await Session.findOne({
        where: { session_id: sessionId }
      });

      if (session) {
        await session.update({ is_active: false });
      }

      return true;
    } catch (error) {
      throw new Error(`Error al desactivar sesión: ${error.message}`);
    }
  }

  // Desactivar todas las sesiones de un usuario
  async deactivateAllUserSessions(userId) {
    try {
      await Session.update(
        { is_active: false },
        { where: { user_id: userId, is_active: true } }
      );

      return true;
    } catch (error) {
      throw new Error(`Error al desactivar sesiones del usuario: ${error.message}`);
    }
  }

  // Limpiar sesiones expiradas
  async cleanupExpiredSessions() {
    try {
      const result = await Session.update(
        { is_active: false },
        {
          where: {
            expires_at: { [require('sequelize').Op.lt]: new Date() },
            is_active: true
          }
        }
      );

      return result[0]; // Número de sesiones desactivadas
    } catch (error) {
      throw new Error(`Error al limpiar sesiones expiradas: ${error.message}`);
    }
  }

  // Obtener todas las sesiones activas de un usuario
  async getUserSessions(userId) {
    try {
      const sessions = await Session.findAll({
        where: {
          user_id: userId,
          is_active: true
        },
        attributes: ['id', 'session_id', 'ip_address', 'user_agent', 'created_at', 'expires_at'],
        order: [['created_at', 'DESC']]
      });

      return sessions;
    } catch (error) {
      throw new Error(`Error al obtener sesiones del usuario: ${error.message}`);
    }
  }

  // Método de compatibilidad (para transición)
  async verifyToken(token) {
    // Intentar verificar como access token
    let sessionData = await this.verifyAccessToken(token);
    
    // Si no es un access token válido, intentar como refresh token
    if (!sessionData) {
      sessionData = await this.verifyRefreshToken(token);
    }

    return sessionData;
  }

  // Método de compatibilidad (para transición)
  async renewSession(sessionId) {
    return this.renewAccessToken(sessionId);
  }
}

module.exports = new SessionService();
