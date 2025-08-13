const AccessoryService = require('../services/AccessoryService');
const { logger } = require('../config/logger');

/**
 * Obtiene todos los accesorios compatibles para un producto principal
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAccessoriesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto válido es requerido'
      });
    }

    const result = await AccessoryService.getAccessoriesByProduct(parseInt(productId));
    
    logger.info(`Accesorios obtenidos para producto ${productId}: ${result.count} encontrados`);

    res.json({
      success: true,
      data: result,
      count: result.count
    });

  } catch (error) {
    logger.error('Error al obtener accesorios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crea una nueva relación de accesorio
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createAccessory = async (req, res) => {
  try {
    const { main_product_id, accessory_product_id } = req.body;

    // Validaciones
    if (!main_product_id || !accessory_product_id) {
      return res.status(400).json({
        success: false,
        message: 'main_product_id y accessory_product_id son requeridos'
      });
    }

    const accessory = await AccessoryService.createAccessory(
      parseInt(main_product_id), 
      parseInt(accessory_product_id)
    );

    res.status(201).json({
      success: true,
      message: 'Accesorio creado exitosamente',
      data: accessory
    });

  } catch (error) {
    logger.error('Error al crear accesorio:', error);
    
    if (error.message.includes('no existen') || 
        error.message.includes('no puede ser accesorio') ||
        error.message.includes('ya existe')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Elimina una relación de accesorio
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteAccessory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID válido es requerido'
      });
    }

    await AccessoryService.deleteAccessory(parseInt(id));

    res.json({
      success: true,
      message: 'Accesorio eliminado exitosamente'
    });

  } catch (error) {
    logger.error('Error al eliminar accesorio:', error);
    
    if (error.message === 'Accesorio no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAccessoriesByProduct,
  createAccessory,
  deleteAccessory
};
