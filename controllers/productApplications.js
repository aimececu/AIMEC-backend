const ProductApplication = require('../models/ProductApplication');
const Product = require('../models/Product');

// =====================================================
// CONTROLADOR DE APLICACIONES DE PRODUCTOS
// =====================================================

// Obtener todas las aplicaciones o filtrar por producto
const getAllApplications = async (req, res, next) => {
  try {
    const { product_id } = req.query;
    
    let whereClause = {};
    if (product_id) {
      whereClause.product_id = parseInt(product_id);
    }

    const applications = await ProductApplication.findAll({
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
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Obtener aplicaciones de un producto específico
const getApplicationsByProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    
    const applications = await ProductApplication.findAll({
      where: { product_id: productId },
      order: [['sort_order', 'ASC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Obtener aplicación por ID
const getApplicationById = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    const application = await ProductApplication.findByPk(applicationId, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Aplicación no encontrada"
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva aplicación
const createApplication = async (req, res, next) => {
  try {
    const { product_id, application_text, sort_order = 0 } = req.body;

    // Validar que el producto existe
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    const application = await ProductApplication.create({
      product_id,
      application_text,
      sort_order
    });

    res.status(201).json({
      success: true,
      data: application,
      message: "Aplicación creada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar aplicación
const updateApplication = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { application_text, sort_order } = req.body;

    const application = await ProductApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Aplicación no encontrada"
      });
    }

    await application.update({
      application_text,
      sort_order
    });

    res.json({
      success: true,
      data: application,
      message: "Aplicación actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar aplicación
const deleteApplication = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await ProductApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Aplicación no encontrada"
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: "Aplicación eliminada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllApplications,
  getApplicationsByProduct,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};
