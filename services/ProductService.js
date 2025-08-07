const { Product, Brand, Category, Subcategory, ProductSeries, ProductSpecification, SpecificationType, Application, ProductApplication, ProductRelated, ProductFeature, Feature, Certification, ProductCertification } = require('../models');
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
        },
        {
          model: ProductSeries,
          as: 'series',
          attributes: ['id', 'name']
        }
      ];

      // Atributos específicos del producto
      const productAttributes = [
        'id', 'sku', 'name', 'description', 'short_description',
        'price', 'original_price', 'cost_price', 'stock_quantity', 'min_stock_level',
        'warranty_months', 'lead_time_days', 'weight', 'dimensions',
        'voltage', 'power', 'temperature_range', 'ip_rating', 'material', 'color',
        'country_of_origin', 'compliance', 'manual_url', 'datasheet_url',
        'additional_images', 'main_image', 'is_featured', 'is_active',
        'meta_title', 'meta_description', 'meta_keywords',
        'brand_id', 'category_id', 'subcategory_id', 'series_id',
        'created_at', 'updated_at'
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
        attributes: [
          'id', 'sku', 'name', 'description', 'short_description',
          'price', 'original_price', 'cost_price', 'stock_quantity', 'min_stock_level',
          'warranty_months', 'lead_time_days', 'weight', 'dimensions',
          'voltage', 'power', 'temperature_range', 'ip_rating', 'material', 'color',
          'country_of_origin', 'compliance', 'manual_url', 'datasheet_url',
          'additional_images', 'main_image', 'is_featured', 'is_active',
          'meta_title', 'meta_description', 'meta_keywords',
          'brand_id', 'category_id', 'subcategory_id', 'series_id',
          'created_at', 'updated_at'
        ],
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo_url', 'website']
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
          },
          {
            model: ProductApplication,
            as: 'applications',
            include: [
              {
                model: Application,
                as: 'application',
                attributes: ['id', 'name', 'description', 'icon']
              }
            ]
          },
          {
            model: ProductFeature,
            as: 'features',
            include: [
              {
                model: Feature,
                as: 'feature',
                attributes: ['id', 'name', 'description']
              }
            ]
          },
          {
            model: ProductCertification,
            as: 'certifications',
            include: [
              {
                model: Certification,
                as: 'certification',
                attributes: ['id', 'name', 'description']
              }
            ]
          },
          {
            model: ProductRelated,
            as: 'relatedProducts',
            include: [
              {
                model: Product,
                as: 'relatedProduct',
                attributes: ['id', 'name', 'price', 'main_image'],
                include: [
                  {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'name']
                  }
                ]
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

  // Obtener producto por slug (deshabilitado - no hay columna slug)
  // async getProductBySlug(slug) {
  //   try {
  //     const product = await Product.findOne({
  //       where: { slug, is_active: true },
  //       include: [
  //         {
  //           model: Brand,
  //           as: 'brand',
  //           attributes: ['id', 'name', 'logo', 'website']
  //         },
  //         {
  //           model: Category,
  //           as: 'category',
  //           attributes: ['id', 'name']
  //         },
  //         {
  //           model: Subcategory,
  //           as: 'subcategory',
  //           attributes: ['id', 'name']
  //         },
  //         {
  //           model: ProductSeries,
  //           as: 'series',
  //           attributes: ['id', 'name']
  //         },
  //         {
  //           model: ProductSpecification,
  //           as: 'specifications',
  //           include: [
  //             {
  //               model: SpecificationType,
  //               as: 'specificationType',
  //               attributes: ['id', 'name', 'unit', 'data_type']
  //             }
  //           ]
  //         }
  //       ]
  //     });

  //     return product;
  //   } catch (error) {
  //     throw new Error(`Error al obtener producto por slug: ${error.message}`);
  //   }
  // }

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

      // Remover slug si existe en los datos
      delete productData.slug;

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

      // Remover slug si existe en los datos
      delete productData.slug;

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
          attributes: ['id', 'name', 'logo_url']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
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
            attributes: ['id', 'name', 'logo_url']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
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
            attributes: ['id', 'name', 'logo_url']
          },
          {
            model: Category,
            as: 'category',
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
        where: { brand_id: brandId, is_active: true },
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
      const inStockProducts = await Product.count({ 
        where: { 
          stock_quantity: { [Op.gt]: 0 }, 
          is_active: true 
        } 
      });
      const outOfStockProducts = await Product.count({ 
        where: { 
          stock_quantity: 0, 
          is_active: true 
        } 
      });
      const lowStockProducts = await Product.count({
        where: {
          stock_quantity: { [Op.lte]: 10 },
          stock_quantity: { [Op.gt]: 0 },
          is_active: true
        }
      });

      return {
        total_products: totalProducts,
        in_stock: inStockProducts,
        out_of_stock: outOfStockProducts,
        low_stock: lowStockProducts
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // =====================================================
  // MÉTODOS DE APLICACIONES DE PRODUCTOS
  // =====================================================

  // Obtener aplicaciones de un producto
  async getProductApplications(productId) {
    try {
      const applications = await ProductApplication.findAll({
        where: { product_id: productId },
        include: [
          {
            model: Application,
            as: 'application',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      return applications;
    } catch (error) {
      throw new Error(`Error al obtener aplicaciones del producto: ${error.message}`);
    }
  }

  // Asignar aplicaciones a un producto
  async assignApplicationsToProduct(productId, applicationIds) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Eliminar asignaciones existentes
      await ProductApplication.destroy({
        where: { product_id: productId }
      });

      // Crear nuevas asignaciones
      const assignments = applicationIds.map(appId => ({
        product_id: productId,
        application_id: appId
      }));

      const result = await ProductApplication.bulkCreate(assignments);
      return result;
    } catch (error) {
      throw new Error(`Error al asignar aplicaciones: ${error.message}`);
    }
  }

  // =====================================================
  // MÉTODOS DE CARACTERÍSTICAS DE PRODUCTOS
  // =====================================================

  // Obtener características de un producto
  async getProductFeatures(productId) {
    try {
      const features = await ProductFeature.findAll({
        where: { product_id: productId },
        include: [
          {
            model: Feature,
            as: 'feature',
            attributes: ['id', 'name', 'description', 'unit']
          }
        ]
      });

      return features;
    } catch (error) {
      throw new Error(`Error al obtener características del producto: ${error.message}`);
    }
  }

  // Agregar característica a un producto
  async addProductFeature(productId, featureData) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const feature = await ProductFeature.create({
        product_id: productId,
        feature_id: featureData.feature_id,
        value: featureData.value,
        unit: featureData.unit
      });

      return feature;
    } catch (error) {
      throw new Error(`Error al agregar característica: ${error.message}`);
    }
  }

  // Actualizar característica de un producto
  async updateProductFeature(productId, featureId, featureData) {
    try {
      const feature = await ProductFeature.findOne({
        where: { 
          product_id: productId, 
          id: featureId 
        }
      });

      if (!feature) {
        throw new Error('Característica no encontrada');
      }

      await feature.update({
        value: featureData.value,
        unit: featureData.unit
      });

      return feature;
    } catch (error) {
      throw new Error(`Error al actualizar característica: ${error.message}`);
    }
  }

  // Eliminar característica de un producto
  async deleteProductFeature(productId, featureId) {
    try {
      const feature = await ProductFeature.findOne({
        where: { 
          product_id: productId, 
          id: featureId 
        }
      });

      if (!feature) {
        throw new Error('Característica no encontrada');
      }

      await feature.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar característica: ${error.message}`);
    }
  }

  // =====================================================
  // MÉTODOS DE PRODUCTOS RELACIONADOS
  // =====================================================

  // Obtener productos relacionados
  async getProductRelated(productId) {
    try {
      const related = await ProductRelated.findAll({
        where: { product_id: productId },
        include: [
          {
            model: Product,
            as: 'relatedProduct',
            attributes: ['id', 'sku', 'name', 'description', 'price', 'main_image'],
            include: [
              {
                model: Brand,
                as: 'brand',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      return related;
    } catch (error) {
      throw new Error(`Error al obtener productos relacionados: ${error.message}`);
    }
  }

  // Agregar producto relacionado
  async addProductRelated(productId, relatedProductId) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const relatedProduct = await Product.findByPk(relatedProductId);
      if (!relatedProduct) {
        throw new Error('Producto relacionado no encontrado');
      }

      const related = await ProductRelated.create({
        product_id: productId,
        related_product_id: relatedProductId
      });

      return related;
    } catch (error) {
      throw new Error(`Error al agregar producto relacionado: ${error.message}`);
    }
  }

  // Actualizar producto relacionado
  async updateProductRelated(productId, relatedId, newRelatedProductId) {
    try {
      const related = await ProductRelated.findOne({
        where: { 
          product_id: productId, 
          id: relatedId 
        }
      });

      if (!related) {
        throw new Error('Relación no encontrada');
      }

      const newRelatedProduct = await Product.findByPk(newRelatedProductId);
      if (!newRelatedProduct) {
        throw new Error('Nuevo producto relacionado no encontrado');
      }

      await related.update({
        related_product_id: newRelatedProductId
      });

      return related;
    } catch (error) {
      throw new Error(`Error al actualizar producto relacionado: ${error.message}`);
    }
  }

  // Eliminar producto relacionado
  async deleteProductRelated(productId, relatedId) {
    try {
      const related = await ProductRelated.findOne({
        where: { 
          product_id: productId, 
          id: relatedId 
        }
      });

      if (!related) {
        throw new Error('Relación no encontrada');
      }

      await related.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar producto relacionado: ${error.message}`);
    }
  }
}

module.exports = new ProductService(); 