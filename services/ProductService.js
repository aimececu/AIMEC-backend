const { Product, Brand, Category, Subcategory } = require('../models');
const { Op } = require('sequelize');

class ProductService {
  // Obtener todos los productos con filtros
  async getAllProducts(filters = {}) {
    try {
      const whereClause = { is_active: true };
      const includeClause = [
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name', 'logo_url']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name']
        }
      ];

      // Atributos específicos del producto
      const productAttributes = [
        'id', 'sku', 'name', 'description', 'price', 'stock_quantity', 
        'min_stock_level', 'weight', 'dimensions', 'main_image', 'is_active',
        'brand_id', 'category_id', 'subcategory_id', 'created_at', 'updated_at'
      ];

      // Aplicar filtros
      if (filters.category_id) {
        whereClause.category_id = filters.category_id;
      }

      if (filters.brand_id) {
        whereClause.brand_id = filters.brand_id;
      }

      if (filters.subcategory_id) {
        whereClause.subcategory_id = filters.subcategory_id;
      }

      if (filters.min_price) {
        whereClause.price = { [Op.gte]: filters.min_price };
      }

      if (filters.max_price) {
        whereClause.price = { ...whereClause.price, [Op.lte]: filters.max_price };
      }

      if (filters.in_stock) {
        whereClause.stock_quantity = { [Op.gt]: 0 };
      }

      const options = {
        where: whereClause,
        include: includeClause,
        attributes: productAttributes,
        order: [['created_at', 'DESC']]
      };

      // Paginación
      if (filters.limit) {
        options.limit = filters.limit;
      }

      if (filters.offset) {
        options.offset = filters.offset;
      }

      const products = await Product.findAndCountAll(options);
      return {
        products: products.rows,
        total: products.count,
        limit: filters.limit || null,
        offset: filters.offset || 0
      };
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo_url', 'website']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description', 'icon', 'color']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name', 'description']
          }
        ],
        attributes: [
          'id', 'sku', 'name', 'description', 'price', 'stock_quantity', 
          'min_stock_level', 'weight', 'dimensions', 'main_image', 'is_active',
          'brand_id', 'category_id', 'subcategory_id', 'created_at', 'updated_at'
        ]
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return product;
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  // Crear producto
  async createProduct(productData) {
    try {
      const cleanedData = this.cleanNumericFields(productData);
      const product = await Product.create(cleanedData);
      
      // Obtener el producto creado con sus relaciones
      return await this.getProductById(product.id);
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  // Limpiar campos numéricos
  cleanNumericFields(data) {
    const cleaned = { ...data };
    const numericFields = [
      'price', 'stock_quantity', 'min_stock_level', 'weight'
    ];
    
    numericFields.forEach(field => {
      if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
        cleaned[field] = null;
      } else if (typeof cleaned[field] === 'string') {
        const num = parseFloat(cleaned[field]);
        cleaned[field] = isNaN(num) ? null : num;
      }
    });
    
    return cleaned;
  }

  // Actualizar producto
  async updateProduct(id, productData) {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const cleanedData = this.cleanNumericFields(productData);
      await product.update(cleanedData);
      
      // Obtener el producto actualizado con sus relaciones
      return await this.getProductById(id);
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  // Eliminar producto (soft delete)
  async deleteProduct(id) {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      await product.update({ is_active: false });
      return { message: 'Producto eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  // Buscar productos
  async searchProducts(searchTerm, filters = {}) {
    try {
      const whereClause = {
        is_active: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { sku: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      };

      const includeClause = [
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name', 'logo_url']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name']
        }
      ];

      const options = {
        where: whereClause,
        include: includeClause,
        order: [['name', 'ASC']]
      };

      if (filters.limit) {
        options.limit = filters.limit;
      }

      const products = await Product.findAndCountAll(options);
      return {
        products: products.rows,
        total: products.count,
        searchTerm
      };
    } catch (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(categoryId, limit = 20) {
    try {
      const products = await Product.findAll({
        where: {
          category_id: categoryId,
          is_active: true
        },
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo_url']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name']
          }
        ],
        limit,
        order: [['created_at', 'DESC']]
      });

      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos por categoría: ${error.message}`);
    }
  }

  // Obtener productos por marca
  async getProductsByBrand(brandId) {
    try {
      const products = await Product.findAll({
        where: {
          brand_id: brandId,
          is_active: true
        },
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo_url']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos por marca: ${error.message}`);
    }
  }

  // Obtener estadísticas de productos
  async getProductStats() {
    try {
      const totalProducts = await Product.count({
        where: { is_active: true }
      });

      const lowStockProducts = await Product.count({
        where: {
          is_active: true,
          stock_quantity: { [Op.lte]: { [Op.col]: 'min_stock_level' } }
        }
      });

      const outOfStockProducts = await Product.count({
        where: {
          is_active: true,
          stock_quantity: 0
        }
      });

      return {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = new ProductService(); 