const { Product, Brand, Category, Subcategory, ProductFeature, ProductApplication } = require('../models');
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
      
      // Obtener counts de características y aplicaciones para cada producto
      const productIds = products.rows.map(p => p.id);
      
      if (productIds.length > 0) {
        const [featuresCounts, applicationsCounts] = await Promise.all([
          ProductFeature.findAll({
            attributes: [
              'product_id',
              [ProductFeature.sequelize.fn('COUNT', ProductFeature.sequelize.col('id')), 'count']
            ],
            where: { product_id: { [Op.in]: productIds } },
            group: ['product_id'],
            raw: true
          }),
          ProductApplication.findAll({
            attributes: [
              'product_id',
              [ProductApplication.sequelize.fn('COUNT', ProductApplication.sequelize.col('id')), 'count']
            ],
            where: { product_id: { [Op.in]: productIds } },
            group: ['product_id'],
            raw: true
          })
        ]);

        // Crear mapas para acceso rápido
        const featuresMap = new Map(featuresCounts.map(f => [f.product_id, parseInt(f.count)]));
        const applicationsMap = new Map(applicationsCounts.map(a => [a.product_id, parseInt(a.count)]));

        // Agregar counts a cada producto
        const productsWithCounts = products.rows.map(product => ({
          ...product.toJSON(),
          features_count: featuresMap.get(product.id) || 0,
          applications_count: applicationsMap.get(product.id) || 0
        }));

        return {
          products: productsWithCounts,
          total: products.count,
          limit: filters.limit || null,
          offset: filters.offset || 0
        };
      }
      
      return {
        products: products.rows.map(p => ({
          ...p.toJSON(),
          features_count: 0,
          applications_count: 0
        })),
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

      // Obtener counts de características y aplicaciones
      const [featuresCount, applicationsCount] = await Promise.all([
        ProductFeature.count({ where: { product_id: product.id } }),
        ProductApplication.count({ where: { product_id: product.id } })
      ]);

      // Agregar counts al producto
      const productWithCounts = product.toJSON();
      productWithCounts.features_count = featuresCount;
      productWithCounts.applications_count = applicationsCount;

      return productWithCounts;
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
      console.log('Contando productos...');
      const totalProducts = await Product.count({
        where: { is_active: true }
      });
      console.log('Total productos:', totalProducts);

      const totalBrands = await Brand.count({
        where: { is_active: true }
      });
      console.log('Total marcas:', totalBrands);

      const totalCategories = await Category.count({
        where: { is_active: true }
      });
      console.log('Total categorías:', totalCategories);

      const result = {
        total_products: totalProducts,
        total_brands: totalBrands,
        total_categories: totalCategories
      };
      
      console.log('Resultado final:', result);
      return result;
    } catch (error) {
      console.error('Error en getProductStats:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Obtener solo el conteo de productos
  async getProductCount() {
    try {
      return await Product.count({
        where: { is_active: true }
      });
    } catch (error) {
      throw new Error(`Error al contar productos: ${error.message}`);
    }
  }
}

module.exports = new ProductService(); 