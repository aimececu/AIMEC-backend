const Application = require('../models/Application');
const ProductApplication = require('../models/ProductApplication');
const Product = require('../models/Product');

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Obtener todas las aplicaciones
 *     tags: [Aplicaciones]
 *     responses:
 *       200:
 *         description: Lista de aplicaciones
 */
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

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Crear nueva aplicación
 *     tags: [Aplicaciones]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Aplicación creada exitosamente
 */
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

/**
 * @swagger
 * /applications/{id}:
 *   put:
 *     summary: Actualizar aplicación
 *     tags: [Aplicaciones]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Aplicación actualizada exitosamente
 */
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

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Eliminar aplicación
 *     tags: [Aplicaciones]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aplicación eliminada exitosamente
 */
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

/**
 * @swagger
 * /products/{productId}/applications:
 *   get:
 *     summary: Obtener aplicaciones de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aplicaciones del producto
 */
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

/**
 * @swagger
 * /products/{productId}/applications:
 *   post:
 *     summary: Asignar aplicaciones a un producto
 *     tags: [Productos]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationIds
 *             properties:
 *               applicationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Aplicaciones asignadas exitosamente
 */
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