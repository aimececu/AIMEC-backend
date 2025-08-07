const jwt = require('jsonwebtoken');

// Configuración de JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

// Función para generar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

// Función para verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// Middleware para verificar autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }
};

// Función para decodificar token sin verificar (para obtener información)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Error al decodificar token');
  }
};

module.exports = {
  jwtConfig,
  generateToken,
  verifyToken,
  authenticateToken,
  decodeToken
};
