const { Product, Brand, Category, Subcategory, ProductSeries, ProductSpecification, SpecificationType } = require('../models');
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
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductSeries,
          as: 'series',
          attributes: ['id', 'name']
        }
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

      if (filters.featured) {
        whereClause.is_featured = true;
      }

      if (filters.in_stock) {
        whereClause.stock_quantity = { [Op.gt]: 0 };
      }

      const options = {
        where: whereClause,
        include: includeClause,
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
            attributes: ['id', 'name', 'logo', 'website']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: ProductSeries,
            as: 'series',
            attributes: ['id', 'name']
          },
          {
            model: ProductSpecification,
            as: 'specifications',
            include: [
              {
                model: SpecificationType,
                as: 'specificationType',
                attributes: ['id', 'name', 'unit', 'data_type']
              }
            ]
          }
        ]
      });

      return product;
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  // Obtener producto por slug
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({
        where: { slug, is_active: true },
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo', 'website']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['id', 'name', 'slug']
          },
          {
            model: ProductSeries,
            as: 'series',
            attributes: ['id', 'name']
          },
          {
            model: ProductSpecification,
            as: 'specifications',
            include: [
              {
                model: SpecificationType,
                as: 'specificationType',
                attributes: ['id', 'name', 'unit', 'data_type']
              }
            ]
          }
        ]
      });

      return product;
    } catch (error) {
      throw new Error(`Error al obtener producto por slug: ${error.message}`);
    }
  }

  // Crear nuevo producto
  async createProduct(productData) {
    try {
      // Validar SKU único
      const existingProduct = await Product.findOne({
        where: { sku: productData.sku }
      });

      if (existingProduct) {
        throw new Error('El SKU ya existe');
      }

      // Validar slug único
      const existingSlug = await Product.findOne({
        where: { slug: productData.slug }
      });

      if (existingSlug) {
        throw new Error('El slug ya existe');
      }

      const product = await Product.create(productData);
      return product;
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  // Actualizar producto
  async updateProduct(id, productData) {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Validar SKU único si se está cambiando
      if (productData.sku && productData.sku !== product.sku) {
        const existingProduct = await Product.findOne({
          where: { sku: productData.sku }
        });

        if (existingProduct) {
          throw new Error('El SKU ya existe');
        }
      }

      // Validar slug único si se está cambiando
      if (productData.slug && productData.slug !== product.slug) {
        const existingSlug = await Product.findOne({
          where: { slug: productData.slug }
        });

        if (existingSlug) {
          throw new Error('El slug ya existe');
        }
      }

      await product.update(productData);
      return product;
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
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ];

      // Aplicar filtros adicionales
      if (filters.category_id) {
        whereClause.category_id = filters.category_id;
      }

      if (filters.brand_id) {
        whereClause.brand_id = filters.brand_id;
      }

      if (filters.min_price) {
        whereClause.price = { [Op.gte]: filters.min_price };
      }

      if (filters.max_price) {
        whereClause.price = { ...whereClause.price, [Op.lte]: filters.max_price };
      }

      const options = {
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']]
      };

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
        searchTerm
      };
    } catch (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }
  }

  // Obtener productos destacados
  async getFeaturedProducts(limit = 10) {
    try {
      const products = await Product.findAll({
        where: { is_featured: true, is_active: true },
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        limit,
        order: [['created_at', 'DESC']]
      });

      return products;
    } catch (error) {
      throw new Error(`Error al obtener productos destacados: ${error.message}`);
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(categoryId, limit = 20) {
    try {
      const products = await Product.findAll({
        where: { category_id: categoryId, is_active: true },
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
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
        where: { brand_id: brandId, is_active: true },
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
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
      const totalProducts = await Product.count({ where: { is_active: true } });
      const featuredProducts = await Product.count({ where: { is_featured: true, is_active: true } });
      const outOfStockProducts = await Product.count({ where: { stock_quantity: 0, is_active: true } });
      const lowStockProducts = await Product.count({
        where: {
          stock_quantity: { [Op.lte]: 10 },
          stock_quantity: { [Op.gt]: 0 },
          is_active: true
        }
      });

      return {
        total: totalProducts,
        featured: featuredProducts,
        outOfStock: outOfStockProducts,
        lowStock: lowStockProducts
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = new ProductService(); 