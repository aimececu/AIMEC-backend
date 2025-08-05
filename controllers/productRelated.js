const ProductRelated = require('../models/ProductRelated');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

/**
 * @swagger
 * /products/{productId}/related:
 *   get:
 *     summary: Obtener productos relacionados
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [accessory, alternative, upgrade, replacement, complementary]
 *     responses:
 *       200:
 *         description: Productos relacionados
 */
const getProductRelated = async (req, res) => {
  try {
    const { productId } = req.params;
    const { type } = req.query;

    const whereClause = { product_id: productId, is_active: true };
    if (type) {
      whereClause.relationship_type = type;
    }

    const relatedProducts = await ProductRelated.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'relatedProduct',
          where: { is_active: true },
          include: [
            { model: Brand, as: 'brand' },
            { model: Category, as: 'category' }
          ]
        }
      ],
      order: [['sort_order', 'ASC']]
    });

    res.json({
      success: true,
      data: relatedProducts.map(rp => ({
        id: rp.id,
        relationship_type: rp.relationship_type,
        description: rp.description,
        sort_order: rp.sort_order,
        product: rp.relatedProduct
      }))
    });
  } catch (error) {
    console.error('Error al obtener productos relacionados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/related:
 *   post:
 *     summary: Agregar producto relacionado
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
 *               - related_product_id
 *               - relationship_type
 *             properties:
 *               related_product_id:
 *                 type: integer
 *               relationship_type:
 *                 type: string
 *                 enum: [accessory, alternative, upgrade, replacement, complementary]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto relacionado agregado exitosamente
 */
const addProductRelated = async (req, res) => {
  try {
    const { productId } = req.params;
    const { related_product_id, relationship_type, description, sort_order = 0 } = req.body;

    if (!related_product_id || !relationship_type) {
      return res.status(400).json({
        success: false,
        error: 'related_product_id y relationship_type son requeridos'
      });
    }

    // Verificar que ambos productos existen
    const [product, relatedProduct] = await Promise.all([
      Product.findByPk(productId),
      Product.findByPk(related_product_id)
    ]);

    if (!product || !relatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Uno o ambos productos no encontrados'
      });
    }

    // Verificar que no existe ya la relación
    const existingRelation = await ProductRelated.findOne({
      where: {
        product_id: productId,
        related_product_id: related_product_id
      }
    });

    if (existingRelation) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una relación entre estos productos'
      });
    }

    const productRelated = await ProductRelated.create({
      product_id: productId,
      related_product_id,
      relationship_type,
      description,
      sort_order
    });

    res.status(201).json({
      success: true,
      message: 'Producto relacionado agregado exitosamente',
      data: productRelated
    });
  } catch (error) {
    console.error('Error al agregar producto relacionado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/related/{relatedId}:
 *   put:
 *     summary: Actualizar producto relacionado
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
 *         name: relatedId
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
 *               relationship_type:
 *                 type: string
 *                 enum: [accessory, alternative, upgrade, replacement, complementary]
 *               description:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto relacionado actualizado exitosamente
 */
const updateProductRelated = async (req, res) => {
  try {
    const { productId, relatedId } = req.params;
    const { relationship_type, description, sort_order, is_active } = req.body;

    const productRelated = await ProductRelated.findOne({
      where: {
        id: relatedId,
        product_id: productId
      }
    });

    if (!productRelated) {
      return res.status(404).json({
        success: false,
        error: 'Relación de producto no encontrada'
      });
    }

    await productRelated.update({
      relationship_type,
      description,
      sort_order,
      is_active
    });

    res.json({
      success: true,
      message: 'Producto relacionado actualizado exitosamente',
      data: productRelated
    });
  } catch (error) {
    console.error('Error al actualizar producto relacionado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/related/{relatedId}:
 *   delete:
 *     summary: Eliminar producto relacionado
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
 *         name: relatedId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto relacionado eliminado exitosamente
 */
const deleteProductRelated = async (req, res) => {
  try {
    const { productId, relatedId } = req.params;

    const productRelated = await ProductRelated.findOne({
      where: {
        id: relatedId,
        product_id: productId
      }
    });

    if (!productRelated) {
      return res.status(404).json({
        success: false,
        error: 'Relación de producto no encontrada'
      });
    }

    await productRelated.destroy();

    res.json({
      success: true,
      message: 'Producto relacionado eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto relacionado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * @swagger
 * /products/{productId}/related/bulk:
 *   post:
 *     summary: Asignar múltiples productos relacionados
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
 *               - relatedProducts
 *             properties:
 *               relatedProducts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - related_product_id
 *                     - relationship_type
 *                   properties:
 *                     related_product_id:
 *                       type: integer
 *                     relationship_type:
 *                       type: string
 *                       enum: [accessory, alternative, upgrade, replacement, complementary]
 *                     description:
 *                       type: string
 *                     sort_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Productos relacionados asignados exitosamente
 */
const bulkAssignRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { relatedProducts } = req.body;

    if (!Array.isArray(relatedProducts)) {
      return res.status(400).json({
        success: false,
        error: 'relatedProducts debe ser un array'
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

    // Eliminar relaciones existentes
    await ProductRelated.destroy({
      where: { product_id: productId }
    });

    // Crear nuevas relaciones
    const productRelations = relatedProducts.map(rp => ({
      product_id: productId,
      related_product_id: rp.related_product_id,
      relationship_type: rp.relationship_type,
      description: rp.description,
      sort_order: rp.sort_order || 0
    }));

    await ProductRelated.bulkCreate(productRelations);

    res.json({
      success: true,
      message: 'Productos relacionados asignados exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar productos relacionados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getProductRelated,
  addProductRelated,
  updateProductRelated,
  deleteProductRelated,
  bulkAssignRelatedProducts
}; 