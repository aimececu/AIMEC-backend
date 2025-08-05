const ProductFeature = require('../models/ProductFeature');
const Product = require('../models/Product');

/**
 * @swagger
 * /products/{productId}/features:
 *   get:
 *     summary: Obtener características de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Características del producto
 */
const getProductFeatures = async (req, res) => {
  try {
    const { productId } = req.params;

    const features = await ProductFeature.findAll({
      where: { 
        product_id: productId,
        is_active: true 
      },
      order: [['sort_order', 'ASC']]
    });

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error al obtener características del producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/features:
 *   post:
 *     summary: Agregar característica a un producto
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
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Característica agregada exitosamente
 */
const addProductFeature = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, icon, sort_order = 0 } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'El título es requerido'
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

    const feature = await ProductFeature.create({
      product_id: productId,
      title,
      description,
      icon,
      sort_order
    });

    res.status(201).json({
      success: true,
      message: 'Característica agregada exitosamente',
      data: feature
    });
  } catch (error) {
    console.error('Error al agregar característica:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/features/{featureId}:
 *   put:
 *     summary: Actualizar característica de un producto
 *     tags: [Productos]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: featureId
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Característica actualizada exitosamente
 */
const updateProductFeature = async (req, res) => {
  try {
    const { productId, featureId } = req.params;
    const { title, description, icon, sort_order, is_active } = req.body;

    const feature = await ProductFeature.findOne({
      where: {
        id: featureId,
        product_id: productId
      }
    });

    if (!feature) {
      return res.status(404).json({
        success: false,
        error: 'Característica no encontrada'
      });
    }

    await feature.update({
      title,
      description,
      icon,
      sort_order,
      is_active
    });

    res.json({
      success: true,
      message: 'Característica actualizada exitosamente',
      data: feature
    });
  } catch (error) {
    console.error('Error al actualizar característica:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/features/{featureId}:
 *   delete:
 *     summary: Eliminar característica de un producto
 *     tags: [Productos]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Característica eliminada exitosamente
 */
const deleteProductFeature = async (req, res) => {
  try {
    const { productId, featureId } = req.params;

    const feature = await ProductFeature.findOne({
      where: {
        id: featureId,
        product_id: productId
      }
    });

    if (!feature) {
      return res.status(404).json({
        success: false,
        error: 'Característica no encontrada'
      });
    }

    await feature.destroy();

    res.json({
      success: true,
      message: 'Característica eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar característica:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/features/bulk:
 *   post:
 *     summary: Asignar múltiples características a un producto
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
 *               - features
 *             properties:
 *               features:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     icon:
 *                       type: string
 *                     sort_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Características asignadas exitosamente
 */
const bulkAssignFeatures = async (req, res) => {
  try {
    const { productId } = req.params;
    const { features } = req.body;

    if (!Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        error: 'features debe ser un array'
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

    // Eliminar características existentes
    await ProductFeature.destroy({
      where: { product_id: productId }
    });

    // Crear nuevas características
    const productFeatures = features.map(feature => ({
      product_id: productId,
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      sort_order: feature.sort_order || 0
    }));

    await ProductFeature.bulkCreate(productFeatures);

    res.json({
      success: true,
      message: 'Características asignadas exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar características:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getProductFeatures,
  addProductFeature,
  updateProductFeature,
  deleteProductFeature,
  bulkAssignFeatures
}; 