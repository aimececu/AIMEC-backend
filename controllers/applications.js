const Application = require('../models/Application');
const ProductApplication = require('../models/ProductApplication');
const Product = require('../models/Product');


const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error al obtener aplicaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};


const createApplication = async (req, res) => {
  try {
    const { name, description, icon, sort_order = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
    }

    const application = await Application.create({
      name,
      description,
      icon,
      sort_order
    });

    res.status(201).json({
      success: true,
      message: 'Aplicación creada exitosamente',
      data: application
    });
  } catch (error) {
    console.error('Error al crear aplicación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};





const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, sort_order, is_active } = req.body;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Aplicación no encontrada'
      });
    }

    await application.update({
      name,
      description,
      icon,
      sort_order,
      is_active
    });

    res.json({
      success: true,
      message: 'Aplicación actualizada exitosamente',
      data: application
    });
  } catch (error) {
    console.error('Error al actualizar aplicación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};


const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Aplicación no encontrada'
      });
    }

    // Verificar si hay productos usando esta aplicación
    const productCount = await ProductApplication.count({
      where: { application_id: id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar. Hay ${productCount} productos usando esta aplicación`
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Aplicación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar aplicación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};






const getProductApplications = async (req, res) => {
  try {
    const { productId } = req.params;

    const applications = await ProductApplication.findAll({
      where: { product_id: productId },
      include: [
        {
          model: Application,
          as: 'application',
          where: { is_active: true }
        }
      ],
      order: [['application', 'sort_order', 'ASC']]
    });

    res.json({
      success: true,
      data: applications.map(pa => pa.application)
    });
  } catch (error) {
    console.error('Error al obtener aplicaciones del producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};


const assignApplicationsToProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { applicationIds } = req.body;

    if (!Array.isArray(applicationIds)) {
      return res.status(400).json({
        success: false,
        error: 'applicationIds debe ser un array'
      });
    }

    // Verificar que el producto existe
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Eliminar aplicaciones existentes
    await ProductApplication.destroy({
      where: { product_id: productId }
    });

    // Crear nuevas relaciones
    const productApplications = applicationIds.map(appId => ({
      product_id: productId,
      application_id: appId
    }));

    await ProductApplication.bulkCreate(productApplications);

    res.json({
      success: true,
      message: 'Aplicaciones asignadas exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar aplicaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getProductApplications,
  assignApplicationsToProduct
}; 