const { RelatedProduct, Product, Brand, Category, Subcategory } = require('../models');

class RelatedProductService {
  /**
   * Obtiene todos los productos relacionados para un producto principal
   * @param {number} productId - ID del producto principal
   * @returns {Promise<Object>} - Objeto con el producto principal y sus productos relacionados
   */
  static async getRelatedProductsByProduct(productId) {
    try {
      // Verificar que el producto principal existe
      const mainProduct = await Product.findByPk(productId);
      if (!mainProduct) {
        return {
          mainProduct: null,
          relatedProducts: [],
          count: 0
        };
      }

      // Buscar productos relacionados
      const relatedProducts = await RelatedProduct.findAll({
        where: {
          product_id: parseInt(productId)
        },
        order: [['created_at', 'ASC']]
      });

      // Si no hay productos relacionados, devolver array vacío
      if (relatedProducts.length === 0) {
        return {
          mainProduct: {
            id: mainProduct.id,
            sku: mainProduct.sku,
            name: mainProduct.name
          },
          relatedProducts: [],
          count: 0
        };
      }

      // Para cada producto relacionado, obtener el producto asociado
      const relatedProductsWithDetails = [];
      for (const relatedProduct of relatedProducts) {
        try {
          const relatedProductDetails = await Product.findByPk(relatedProduct.related_product_id);
          if (relatedProductDetails) {
            relatedProductsWithDetails.push({
              id: relatedProduct.id,
              relationshipType: relatedProduct.relationship_type,

              relatedProduct: {
                id: relatedProductDetails.id,
                sku: relatedProductDetails.sku,
                name: relatedProductDetails.name,
                description: relatedProductDetails.description,
                price: relatedProductDetails.price,
                main_image: relatedProductDetails.main_image,
                is_active: relatedProductDetails.is_active
              }
            });
          }
        } catch (productError) {
          console.log(`Error obteniendo producto relacionado ${relatedProduct.related_product_id}:`, productError);
        }
      }

      const result = {
        mainProduct: {
          id: mainProduct.id,
          sku: mainProduct.sku,
          name: mainProduct.name
        },
        relatedProducts: relatedProductsWithDetails,
        count: relatedProductsWithDetails.length
      };

      return result;

    } catch (error) {
      console.log('Error en RelatedProductService.getRelatedProductsByProduct:', error);
      // Asegurar que el error tenga un mensaje válido
      if (!error || !error.message) {
        throw new Error('Error interno al obtener productos relacionados');
      }
      throw error;
    }
  }

  /**
   * Crea una nueva relación de producto relacionado
   * @param {number} productId - ID del producto principal
   * @param {number} relatedProductId - ID del producto relacionado
   * @param {string} relationshipType - Tipo de relación
   * @returns {Promise<Object>} - Objeto del producto relacionado creado
   */
  static async createRelatedProduct(productId, relatedProductId, relationshipType) {
    try {
      // Verificar que ambos productos existen
      const [mainProduct, relatedProduct] = await Promise.all([
        Product.findByPk(productId),
        Product.findByPk(relatedProductId)
      ]);

      if (!mainProduct || !relatedProduct) {
        throw new Error('Uno o ambos productos no existen');
      }

      // Verificar que no sea el mismo producto
      if (productId === relatedProductId) {
        throw new Error('Un producto no puede estar relacionado consigo mismo');
      }

      // Verificar que la relación no exista ya
      const existingRelatedProduct = await RelatedProduct.findOne({
        where: {
          product_id: productId,
          related_product_id: relatedProductId
        }
      });

      if (existingRelatedProduct) {
        throw new Error('Esta relación de producto ya existe');
      }

      // Crear la relación
      const newRelatedProduct = await RelatedProduct.create({
        product_id: productId,
        related_product_id: relatedProductId,
        relationship_type: relationshipType
      });

      return newRelatedProduct;

    } catch (error) {
      console.log('Error en RelatedProductService.createRelatedProduct:', error);
      throw error;
    }
  }

  /**
   * Crea múltiples productos relacionados con el mismo tipo de relación
   * @param {number} productId - ID del producto principal
   * @param {string} relationshipType - Tipo de relación
   * @param {Array} productIds - Array de IDs de productos a relacionar
   * @returns {Promise<Object>} - Objeto con el resultado de la operación
   */
  static async createMultipleRelatedProducts(productId, relationshipType, productIds) {
    try {
      // Verificar que el producto principal existe
      const mainProduct = await Product.findByPk(productId);
      if (!mainProduct) {
        throw new Error('Producto principal no existe');
      }

      // Verificar que todos los productos relacionados existen
      const relatedProducts = await Product.findAll({
        where: {
          id: productIds
        }
      });

      if (relatedProducts.length !== productIds.length) {
        throw new Error('Algunos productos relacionados no existen');
      }

      // Verificar que no sean el mismo producto
      if (productIds.includes(productId)) {
        throw new Error('Un producto no puede estar relacionado consigo mismo');
      }

      const result = {
        created: 0,
        skipped: 0,
        errors: []
      };

      // Crear las relaciones una por una
      for (let i = 0; i < productIds.length; i++) {
        const relatedProductId = productIds[i];
        
        try {
          // Verificar que la relación no exista ya
          const existingRelatedProduct = await RelatedProduct.findOne({
            where: {
              product_id: productId,
              related_product_id: relatedProductId
            }
          });

          if (existingRelatedProduct) {
            result.skipped++;
            result.errors.push(`Producto ${relatedProductId} ya está relacionado`);
            continue;
          }

          // Crear la relación
          await RelatedProduct.create({
            product_id: productId,
            related_product_id: relatedProductId,
            relationship_type: relationshipType
          });

          result.created++;
        } catch (error) {
          result.errors.push(`Error con producto ${relatedProductId}: ${error.message}`);
        }
      }

      return result;

    } catch (error) {
      console.log('Error en RelatedProductService.createMultipleRelatedProducts:', error);
      throw error;
    }
  }

  /**
   * Actualiza una relación de producto relacionado
   * @param {number} relatedProductId - ID de la relación
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Objeto del producto relacionado actualizado
   */
  static async updateRelatedProduct(relatedProductId, updateData) {
    try {
      const relatedProduct = await RelatedProduct.findByPk(relatedProductId);
      if (!relatedProduct) {
        throw new Error('Producto relacionado no encontrado');
      }

      // Actualizar solo los campos permitidos
      const allowedFields = ['relationship_type'];
      const fieldsToUpdate = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          fieldsToUpdate[field] = updateData[field];
        }
      });

      await relatedProduct.update(fieldsToUpdate);
      return relatedProduct;

    } catch (error) {
      console.log('Error en RelatedProductService.updateRelatedProduct:', error);
      throw error;
    }
  }

  /**
   * Elimina una relación de producto relacionado
   * @param {number} relatedProductId - ID de la relación
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  static async deleteRelatedProduct(relatedProductId) {
    try {
      const relatedProduct = await RelatedProduct.findByPk(relatedProductId);
      if (!relatedProduct) {
        throw new Error('Producto relacionado no encontrado');
      }

      await relatedProduct.destroy();
      return true;

    } catch (error) {
      console.log('Error en RelatedProductService.deleteRelatedProduct:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los productos que tienen un producto específico como relacionado
   * @param {number} relatedProductId - ID del producto relacionado
   * @returns {Promise<Array>} - Array de productos principales
   */
  static async getProductsByRelatedProduct(relatedProductId) {
    try {
      const relatedProducts = await RelatedProduct.findAll({
        where: {
          related_product_id: parseInt(relatedProductId)
        },
        include: [
          {
            model: Product,
            as: 'mainProduct',
            include: [
              {
                model: Brand,
                as: 'brand',
                attributes: ['id', 'name', 'logo_url']
              },
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'color']
              }
            ],
            attributes: [
              'id', 'sku', 'name', 'description', 'short_description',
              'price', 'main_image', 'is_active'
            ]
          }
        ]
      });

      return relatedProducts.map(rel => ({
        id: rel.id,
        relationshipType: rel.relationship_type,
        mainProduct: rel.mainProduct
      }));

    } catch (error) {
      console.log('Error en RelatedProductService.getProductsByRelatedProduct:', error);
      throw error;
    }
  }

  /**
   * Verifica si dos productos están relacionados
   * @param {number} productId - ID del producto principal
   * @param {number} relatedProductId - ID del producto relacionado
   * @returns {Promise<boolean>} - true si están relacionados
   */
  static async areProductsRelated(productId, relatedProductId) {
    try {
      const relatedProduct = await RelatedProduct.findOne({
        where: {
          product_id: productId,
          related_product_id: relatedProductId
        }
      });

      return !!relatedProduct;

    } catch (error) {
      console.log('Error en RelatedProductService.areProductsRelated:', error);
      throw error;
    }
  }


}

module.exports = RelatedProductService;
