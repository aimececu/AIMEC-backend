const RelatedProductService = require('../services/RelatedProductService');

/**
 * Obtiene todos los productos relacionados para un producto principal
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getRelatedProductsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto válido es requerido'
      });
    }

    const result = await RelatedProductService.getRelatedProductsByProduct(parseInt(productId));
    
    // Si no hay producto principal, devolver array vacío en lugar de error
    if (!result.mainProduct) {
      return res.json({
        success: true,
        data: {
          mainProduct: null,
          relatedProducts: [],
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
    console.log('Error al obtener productos relacionados:', error);
    
    // Verificar que error.message existe antes de usarlo
    if (error && error.message === 'Producto principal no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        data: {
          mainProduct: null,
          relatedProducts: [],
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
 * Crea una nueva relación de producto relacionado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createRelatedProduct = async (req, res) => {
  try {
    const { product_id, related_product_id, relationship_type } = req.body;

    // Validaciones
    if (!product_id || !related_product_id || !relationship_type) {
      return res.status(400).json({
        success: false,
        message: 'product_id, related_product_id y relationship_type son requeridos'
      });
    }

    const relatedProduct = await RelatedProductService.createRelatedProduct(
      parseInt(product_id), 
      parseInt(related_product_id),
      relationship_type
    );

    res.status(201).json({
      success: true,
      message: 'Producto relacionado creado exitosamente',
      data: relatedProduct
    });

  } catch (error) {
    console.log('Error al crear producto relacionado:', error);
    
    if (error && error.message && (
        error.message.includes('no existen') || 
        error.message.includes('no puede estar relacionado') ||
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
 * Crea múltiples productos relacionados con el mismo tipo de relación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createMultipleRelatedProducts = async (req, res) => {
  try {
    const { product_id, relationship_type, products } = req.body;

    // Validaciones
    if (!product_id || !relationship_type || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'product_id, relationship_type y products (array no vacío) son requeridos'
      });
    }

    const result = await RelatedProductService.createMultipleRelatedProducts(
      parseInt(product_id),
      relationship_type,
      products
    );

    res.status(201).json({
      success: true,
      message: `${result.created} productos relacionados creados exitosamente`,
      data: {
        created: result.created,
        skipped: result.skipped,
        errors: result.errors
      }
    });

  } catch (error) {
    console.log('Error al crear múltiples productos relacionados:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' && error && error.message ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualiza una relación de producto relacionado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateRelatedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { relationship_type } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID válido es requerido'
      });
    }

    if (!relationship_type) {
      return res.status(400).json({
        success: false,
        message: 'relationship_type es requerido'
      });
    }

    const updateData = { relationship_type };

    const relatedProduct = await RelatedProductService.updateRelatedProduct(parseInt(id), updateData);

    res.json({
      success: true,
      message: 'Producto relacionado actualizado exitosamente',
      data: relatedProduct
    });

  } catch (error) {
    console.log('Error al actualizar producto relacionado:', error);
    
    if (error && error.message === 'Producto relacionado no encontrado') {
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

/**
 * Elimina una relación de producto relacionado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteRelatedProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID válido es requerido'
      });
    }

    await RelatedProductService.deleteRelatedProduct(parseInt(id));

    res.json({
      success: true,
      message: 'Producto relacionado eliminado exitosamente'
    });

  } catch (error) {
    console.log('Error al eliminar producto relacionado:', error);
    
    if (error && error.message === 'Producto relacionado no encontrado') {
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
  getRelatedProductsByProduct,
  createRelatedProduct,
  createMultipleRelatedProducts,
  updateRelatedProduct,
  deleteRelatedProduct
};
