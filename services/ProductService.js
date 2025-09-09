const { Product, Brand, Category, Subcategory, ProductFeature, ProductApplication, Accessory, RelatedProduct } = require('../models');
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
        'id', 'sku', 'sku_ec', 'name', 'description', 'price', 'stock_quantity', 
        'min_stock_level', 'weight', 'dimensions', 'main_image', 'is_active',
        'potencia_kw', 'voltaje', 'frame_size', 'corriente', 'comunicacion', 'alimentacion',
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
      
      // Obtener counts de características, aplicaciones y accesorios para cada producto
      const productIds = products.rows.map(p => p.id);
      
      if (productIds.length > 0) {
        const [featuresCounts, applicationsCounts, accessoriesCounts] = await Promise.all([
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
          }),
          Accessory.findAll({
            attributes: [
              'main_product_id',
              [Accessory.sequelize.fn('COUNT', Accessory.sequelize.col('id')), 'count']
            ],
            where: { main_product_id: { [Op.in]: productIds } },
            group: ['main_product_id'],
            raw: true
          })
        ]);

        // Crear mapas para acceso rápido
        const featuresMap = new Map(featuresCounts.map(f => [f.product_id, parseInt(f.count)]));
        const applicationsMap = new Map(applicationsCounts.map(a => [a.product_id, parseInt(a.count)]));
        const accessoriesMap = new Map(accessoriesCounts.map(acc => [acc.main_product_id, parseInt(acc.count)]));

        // Agregar counts a cada producto
        const productsWithCounts = products.rows.map(product => ({
          ...product.toJSON(),
          features_count: featuresMap.get(product.id) || 0,
          applications_count: applicationsMap.get(product.id) || 0,
          accessories_count: accessoriesMap.get(product.id) || 0
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
          applications_count: 0,
          accessories_count: 0
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
      console.log(`Buscando producto con ID: ${id}`);
      
      // Primero intentar obtener el producto básico sin relaciones
      const product = await Product.findByPk(id, {
        attributes: [
          'id', 'sku', 'sku_ec', 'name', 'description', 'price', 'stock_quantity', 
          'min_stock_level', 'weight', 'dimensions', 'main_image', 'is_active',
          'potencia_kw', 'voltaje', 'frame_size', 'corriente', 'comunicacion', 'alimentacion',
          'brand_id', 'category_id', 'subcategory_id', 'created_at', 'updated_at'
        ]
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      console.log(`Producto encontrado: ${product.name}`);

      // Intentar obtener las relaciones por separado
      let brand = null;
      let category = null;
      let subcategory = null;

      try {
        if (product.brand_id) {
          brand = await Brand.findByPk(product.brand_id, {
            attributes: ['id', 'name', 'logo_url', 'website']
          });
        }
      } catch (error) {
        console.log('Error obteniendo brand:', error.message);
      }

      try {
        if (product.category_id) {
          category = await Category.findByPk(product.category_id, {
            attributes: ['id', 'name', 'description', 'icon', 'color']
          });
        }
      } catch (error) {
        console.log('Error obteniendo category:', error.message);
      }

      try {
        if (product.subcategory_id) {
          subcategory = await Subcategory.findByPk(product.subcategory_id, {
            attributes: ['id', 'name', 'description']
          });
        }
      } catch (error) {
        console.log('Error obteniendo subcategory:', error.message);
      }

      // Obtener counts de forma segura
      let featuresCount = 0;
      let applicationsCount = 0;
      let accessoriesCount = 0;

      try {
        featuresCount = await ProductFeature.count({ where: { product_id: product.id } });
      } catch (error) {
        console.log('Error obteniendo features count:', error.message);
      }

      try {
        applicationsCount = await ProductApplication.count({ where: { product_id: product.id } });
      } catch (error) {
        console.log('Error obteniendo applications count:', error.message);
      }

      try {
        accessoriesCount = await Accessory.count({ where: { main_product_id: product.id } });
      } catch (error) {
        console.log('Error obteniendo accessories count:', error.message);
      }

      // Construir el objeto de respuesta
      const productWithCounts = product.toJSON();
      productWithCounts.brand = brand;
      productWithCounts.category = category;
      productWithCounts.subcategory = subcategory;
      productWithCounts.features_count = featuresCount;
      productWithCounts.applications_count = applicationsCount;
      productWithCounts.accessories_count = accessoriesCount;

      console.log('Producto procesado exitosamente');
      return productWithCounts;
    } catch (error) {
      console.error('Error completo en getProductById:', error);
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

  // Limpiar campos numéricos y campos de ID
  cleanNumericFields(data) {
    const cleaned = { ...data };
    
    // Campos numéricos que pueden ser null
    const numericFields = [
      'price', 'stock_quantity', 'min_stock_level', 'weight', 'potencia_kw', 'corriente'
    ];
    
    // Campos de texto que pueden ser null
    const textFields = [
      'comunicacion', 'alimentacion'
    ];
    
    // Campos de ID que pueden ser null (opcionales)
    const idFields = [
      'brand_id', 'category_id', 'subcategory_id'
    ];
    
    // Limpiar campos numéricos
    numericFields.forEach(field => {
      if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
        cleaned[field] = null;
      } else if (typeof cleaned[field] === 'string') {
        const num = parseFloat(cleaned[field]);
        cleaned[field] = isNaN(num) ? null : num;
      }
    });
    
    // Limpiar campos de texto
    textFields.forEach(field => {
      if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
        cleaned[field] = null;
      }
    });
    
    // Limpiar campos de ID
    idFields.forEach(field => {
      if (cleaned[field] === '' || cleaned[field] === null || cleaned[field] === undefined) {
        cleaned[field] = null;
      } else if (typeof cleaned[field] === 'string') {
        const num = parseInt(cleaned[field]);
        cleaned[field] = isNaN(num) ? null : num;
      }
    });
    
    // Limpiar campos booleanos
    if (cleaned.is_active === '' || cleaned.is_active === null || cleaned.is_active === undefined) {
      cleaned.is_active = true; // Por defecto activo
    } else if (typeof cleaned.is_active === 'string') {
      cleaned.is_active = cleaned.is_active === 'true' || cleaned.is_active === '1';
    }
    
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

  // Exportar productos con todas sus relaciones para CSV
  async exportProductsWithRelations() {
    try {
      console.log('Iniciando exportación de productos con relaciones...');
      
      // Obtener todos los productos activos con relaciones básicas
      const products = await Product.findAll({
        where: { is_active: true },
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['name']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          },
          {
            model: Subcategory,
            as: 'subcategory',
            attributes: ['name']
          }
        ],
        attributes: [
          'id', 'sku', 'sku_ec', 'name', 'description', 'price', 'stock_quantity', 
          'min_stock_level', 'weight', 'dimensions', 'main_image',
          'potencia_kw', 'voltaje', 'frame_size', 'corriente', 'alimentacion', 'comunicacion'
        ],
        order: [['id', 'ASC']]
      });

      console.log(`Encontrados ${products.length} productos, obteniendo relaciones...`);

      // Obtener todas las relaciones en paralelo para todos los productos
      const productIds = products.map(p => p.id);
      
      const [featuresData, applicationsData, accessoriesData, relatedProductsData] = await Promise.all([
        // Características
        ProductFeature.findAll({
          where: { product_id: { [Op.in]: productIds } },
          attributes: ['product_id', 'feature_text'],
          raw: true
        }),
        // Aplicaciones
        ProductApplication.findAll({
          where: { product_id: { [Op.in]: productIds } },
          attributes: ['product_id', 'application_text'],
          raw: true
        }),
        // Accesorios
        Accessory.findAll({
          where: { main_product_id: { [Op.in]: productIds } },
          include: [{
            model: Product,
            as: 'accessoryProduct',
            attributes: ['sku']
          }],
          raw: true,
          nest: true
        }),
        // Productos relacionados
        RelatedProduct.findAll({
          where: { product_id: { [Op.in]: productIds } },
          include: [{
            model: Product,
            as: 'relatedProduct',
            attributes: ['sku']
          }],
          attributes: ['product_id', 'relationship_type'],
          raw: true
        })
      ]);

      console.log('Relaciones obtenidas, procesando datos...');

      // Crear mapas para acceso rápido
      const featuresMap = new Map();
      const applicationsMap = new Map();
      const accessoriesMap = new Map();
      const relatedProductsMap = new Map();

      // Agrupar características por producto
      featuresData.forEach(f => {
        if (!featuresMap.has(f.product_id)) {
          featuresMap.set(f.product_id, []);
        }
        featuresMap.get(f.product_id).push(f.feature_text);
      });

      // Agrupar aplicaciones por producto
      applicationsData.forEach(a => {
        if (!applicationsMap.has(a.product_id)) {
          applicationsMap.set(a.product_id, []);
        }
        applicationsMap.get(a.product_id).push(a.application_text);
      });

      // Agrupar accesorios por producto
      accessoriesData.forEach(acc => {
        if (!accessoriesMap.has(acc.main_product_id)) {
          accessoriesMap.set(acc.main_product_id, []);
        }
        accessoriesMap.get(acc.main_product_id).push(acc.accessoryProduct?.sku);
      });

      // Agrupar productos relacionados por producto
      relatedProductsData.forEach(rp => {
        if (!relatedProductsMap.has(rp.product_id)) {
          relatedProductsMap.set(rp.product_id, []);
        }
        relatedProductsMap.get(rp.product_id).push({
          sku: rp['relatedProduct.sku'],
          type: rp.relationship_type
        });
      });

      // Debug: Log de productos relacionados
      console.log('=== DEBUG PRODUCTOS RELACIONADOS ===');
      console.log('Total productos relacionados encontrados:', relatedProductsData.length);
      console.log('Muestra de productos relacionados:', relatedProductsData.slice(0, 3));
      console.log('Estructura del primer producto relacionado:', JSON.stringify(relatedProductsData[0], null, 2));
      console.log('Mapa de productos relacionados:', Object.fromEntries(relatedProductsMap));
      console.log('=====================================');

      // Construir resultado final
      const result = products.map(product => {
        const productData = product.toJSON();
        
        return {
          ...productData,
          brand: productData.brand?.name || '',
          category: productData.category?.name || '',
          subcategory: productData.subcategory?.name || '',
          features: featuresMap.get(product.id) || [],
          applications: applicationsMap.get(product.id) || [],
          accessories: accessoriesMap.get(product.id) || [],
          related_products: relatedProductsMap.get(product.id) || []
        };
      });

      // Debug: Log del resultado final
      console.log('=== DEBUG RESULTADO FINAL ===');
      console.log('Total productos procesados:', result.length);
      console.log('Muestra del primer producto:', result[0]);
      console.log('Productos con relaciones:', result.filter(p => p.related_products.length > 0).length);
      console.log('=====================================');

      console.log('Exportación completada exitosamente');
      return result;
    } catch (error) {
      console.error('Error en exportProductsWithRelations:', error);
      throw new Error(`Error al exportar productos con relaciones: ${error.message}`);
    }
  }

  // Limpiar todos los productos (hard delete)
  async clearAllProducts() {
    try {
      console.log('Iniciando limpieza de todos los productos...');
      
      // Obtener conteo antes de eliminar
      const totalProducts = await Product.count();
      
      console.log(`Total de productos encontrados: ${totalProducts}`);
      
      if (totalProducts === 0) {
        console.log('No hay productos para eliminar');
        return { deleted_count: 0 };
      }
      
      // Realizar hard delete de todos los productos
      const deletedCount = await Product.destroy({
        where: {}
      });
      
      console.log(`Limpieza completada: ${deletedCount} productos eliminados`);
      
      return { 
        deleted_count: deletedCount,
        total_found: totalProducts
      };
    } catch (error) {
      console.error('Error en clearAllProducts:', error);
      throw new Error(`Error al limpiar productos: ${error.message}`);
    }
  }
}

module.exports = new ProductService(); 