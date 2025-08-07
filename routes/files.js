const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/files');
const { authenticateToken } = require('../config/jwt');
const { uploadLimiter } = require('../config/rateLimit');

// Configuración de multer para manejo de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// =====================================================
// RUTAS DE ARCHIVOS
// =====================================================

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Subir archivo
router.post('/upload', 
  authenticateToken, 
  uploadLimiter, 
  upload.single('file'), 
  fileController.uploadFile
);

// Eliminar archivo
router.delete('/:key', 
  authenticateToken, 
  fileController.deleteFile
);

// Obtener URL firmada
router.get('/:key/url', 
  authenticateToken, 
  fileController.getSignedFileUrl
);

module.exports = router;
