const { uploadToS3, deleteFromS3, getSignedFileUrl } = require('../config/aws');
const { validateInput } = require('../config/validation');
const { authenticateToken } = require('../config/jwt');
const logger = require('../config/logger');

// Esquema de validación para subida de archivos
const uploadSchema = {
  type: { type: 'text', required: false, maxLength: 50 },
  description: { type: 'text', required: false, maxLength: 500 }
};


const uploadFile = async (req, res) => {
  try {
    // Validar datos de entrada
    validateInput(uploadSchema)(req, res, async () => {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo'
        });
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de archivo no permitido'
        });
      }

      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'El archivo es demasiado grande. Máximo 10MB'
        });
      }

      // Generar clave única para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = req.file.originalname.split('.').pop();
      const key = `uploads/${req.user.id}/${timestamp}-${randomString}.${fileExtension}`;

      // Subir archivo a S3
      const result = await uploadToS3(req.file, key, req.file.mimetype);

      // Registrar la subida
      logger.info(`Archivo subido: ${key} por usuario ${req.user.id}`);

      res.json({
        success: true,
        message: 'Archivo subido exitosamente',
        data: {
          url: result.url,
          key: result.key,
          bucket: result.bucket,
          originalName: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          uploadedAt: new Date().toISOString()
        }
      });
    });
  } catch (error) {
    logger.error('Error subiendo archivo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al subir archivo'
    });
  }
};


const deleteFile = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Clave del archivo es requerida'
      });
    }

    // Verificar que el usuario solo pueda eliminar sus propios archivos
    if (!key.includes(`uploads/${req.user.id}/`)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este archivo'
      });
    }

    // Eliminar archivo de S3
    await deleteFromS3(key);

    // Registrar la eliminación
    logger.info(`Archivo eliminado: ${key} por usuario ${req.user.id}`);

    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error eliminando archivo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar archivo'
    });
  }
};


const getSignedUrlController = async (req, res) => {
  try {
    const { key } = req.params;
    const expires = parseInt(req.query.expires) || 3600; // 1 hora por defecto

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Clave del archivo es requerida'
      });
    }

    // Verificar que el usuario solo pueda acceder a sus propios archivos
    if (!key.includes(`uploads/${req.user.id}/`)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a este archivo'
      });
    }

    // Generar URL firmada
    const signedUrl = await getSignedFileUrl(key, 'getObject', expires);

    const expiresAt = new Date(Date.now() + expires * 1000);

    res.json({
      success: true,
      data: {
        url: signedUrl,
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error) {
    logger.error('Error generando URL firmada:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar URL firmada'
    });
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedFileUrl: getSignedUrlController
};
