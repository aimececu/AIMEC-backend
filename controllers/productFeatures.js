const ProductFeature = require('../models/ProductFeature');
const Product = require('../models/Product');

// =====================================================
// CONTROLADOR DE CARACTERÍSTICAS DE PRODUCTOS
// =====================================================

// Obtener todas las características o filtrar por producto
const getAllFeatures = async (req, res, next) => {
  try {
    const { product_id } = req.query;
    
    let whereClause = {};
    if (product_id) {
      whereClause.product_id = parseInt(product_id);
    }

    const features = await ProductFeature.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }
      ],
      order: [['product_id', 'ASC'], ['sort_order', 'ASC']]
    });

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    next(error);
  }
};

// Obtener características de un producto específico
const getFeaturesByProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    
    const features = await ProductFeature.findAll({
      where: { product_id: productId },
      order: [['sort_order', 'ASC']]
    });

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    next(error);
  }
};

// Obtener característica por ID
const getFeatureById = async (req, res, next) => {
  try {
    const featureId = parseInt(req.params.id);
    
    const feature = await ProductFeature.findByPk(featureId, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }
      ]
    });

    if (!feature) {
      return res.status(404).json({
        success: false,
        error: "Característica no encontrada"
      });
    }

    res.json({
      success: true,
      data: feature
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva característica
const createFeature = async (req, res, next) => {
  try {
    const { product_id, feature_text, sort_order = 0 } = req.body;

    // Validar que el producto existe
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    const feature = await ProductFeature.create({
      product_id,
      feature_text,
      sort_order
    });

    res.status(201).json({
      success: true,
      data: feature,
      message: "Característica creada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar característica
const updateFeature = async (req, res, next) => {
  try {
    const featureId = parseInt(req.params.id);
    const { feature_text, sort_order } = req.body;

    const feature = await ProductFeature.findByPk(featureId);
    if (!feature) {
      return res.status(404).json({
        success: false,
        error: "Característica no encontrada"
      });
    }

    await feature.update({
      feature_text,
      sort_order
    });

    res.json({
      success: true,
      data: feature,
      message: "Característica actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar característica
const deleteFeature = async (req, res, next) => {
  try {
    const featureId = parseInt(req.params.id);

    const feature = await ProductFeature.findByPk(featureId);
    if (!feature) {
      return res.status(404).json({
        success: false,
        error: "Característica no encontrada"
      });
    }

    await feature.destroy();

    res.json({
      success: true,
      message: "Característica eliminada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFeatures,
  getFeaturesByProduct,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature
};
