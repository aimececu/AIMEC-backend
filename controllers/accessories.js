const AccessoryService = require('../services/AccessoryService');

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
    
    // Si no hay producto principal, devolver array vacío en lugar de error
    if (!result.mainProduct) {
      return res.json({
        success: true,
        data: {
          mainProduct: null,
          accessories: [],
          count: 0
        },
        count: 0
      });
    }

    res.json({
      success: true,
      data: result,
      count: result.count
    });

  } catch (error) {
    console.log('Error al obtener accesorios:', error);
    
    // Verificar que error.message existe antes de usarlo
    if (error && error.message === 'Producto principal no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        data: {
          mainProduct: null,
          accessories: [],
          count: 0
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' && error && error.message ? error.message : 'Error desconocido'
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
    console.log('Error al crear accesorio:', error);
    
    if (error && error.message && (
        error.message.includes('no existen') || 
        error.message.includes('no puede ser accesorio') ||
        error.message.includes('ya existe'))) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' && error && error.message ? error.message : 'Error desconocido'
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
    console.log('Error al eliminar accesorio:', error);
    
    if (error && error.message === 'Accesorio no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' && error && error.message ? error.message : 'Error desconocido'
    });
  }
};

module.exports = {
  getAccessoriesByProduct,
  createAccessory,
  deleteAccessory
};
