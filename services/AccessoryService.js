const { Accessory, Product, Brand, Category, Subcategory } = require('../models');
const { logger } = require('../config/logger');

class AccessoryService {
  /**
   * Obtiene todos los accesorios compatibles para un producto principal
   * @param {number} productId - ID del producto principal
   * @returns {Promise<Object>} - Objeto con el producto principal y sus accesorios
   */
  static async getAccessoriesByProduct(productId) {
    try {
      // Verificar que el producto principal existe
      const mainProduct = await Product.findByPk(productId);
      if (!mainProduct) {
        throw new Error('Producto principal no encontrado');
      }

      // Buscar accesorios compatibles
      const accessories = await Accessory.findAll({
        where: {
          main_product_id: parseInt(productId)
        },
        include: [
          {
            model: Product,
            as: 'accessoryProduct',
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
              },
              {
                model: Subcategory,
                as: 'subcategory',
                attributes: ['id', 'name']
              }
            ],
            attributes: [
              'id', 'sku', 'name', 'description', 'short_description',
              'price', 'original_price', 'main_image', 'additional_images',
              'is_active', 'stock_quantity'
            ]
          }
        ]
      });

      return {
        mainProduct: {
          id: mainProduct.id,
          sku: mainProduct.sku,
          name: mainProduct.name
        },
        accessories: accessories.map(acc => ({
          id: acc.id,
          accessoryProduct: acc.accessoryProduct
        })),
        count: accessories.length
      };

    } catch (error) {
      logger.error('Error en AccessoryService.getAccessoriesByProduct:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva relación de accesorio
   * @param {number} mainProductId - ID del producto principal
   * @param {number} accessoryProductId - ID del producto accesorio
   * @returns {Promise<Object>} - Objeto del accesorio creado
   */
  static async createAccessory(mainProductId, accessoryProductId) {
    try {
      // Verificar que ambos productos existen
      const [mainProduct, accessoryProduct] = await Promise.all([
        Product.findByPk(mainProductId),
        Product.findByPk(accessoryProductId)
      ]);

      if (!mainProduct || !accessoryProduct) {
        throw new Error('Uno o ambos productos no existen');
      }

      // Verificar que no sea el mismo producto
      if (mainProductId === accessoryProductId) {
        throw new Error('Un producto no puede ser accesorio de sí mismo');
      }

      // Verificar que la relación no exista ya
      const existingAccessory = await Accessory.findOne({
        where: {
          main_product_id: mainProductId,
          accessory_product_id: accessoryProductId
        }
      });

      if (existingAccessory) {
        throw new Error('Esta relación de accesorio ya existe');
      }

      // Crear la relación
      const accessory = await Accessory.create({
        main_product_id: mainProductId,
        accessory_product_id: accessoryProductId
      });

      logger.info(`Accesorio creado: ${mainProductId} -> ${accessoryProductId}`);
      return accessory;

    } catch (error) {
      logger.error('Error en AccessoryService.createAccessory:', error);
      throw error;
    }
  }

  /**
   * Elimina una relación de accesorio
   * @param {number} accessoryId - ID de la relación de accesorio
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  static async deleteAccessory(accessoryId) {
    try {
      const accessory = await Accessory.findByPk(accessoryId);
      if (!accessory) {
        throw new Error('Accesorio no encontrado');
      }

      await accessory.destroy();
      logger.info(`Accesorio eliminado: ${accessoryId}`);
      return true;

    } catch (error) {
      logger.error('Error en AccessoryService.deleteAccessory:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los productos que tienen un producto específico como accesorio
   * @param {number} accessoryProductId - ID del producto accesorio
   * @returns {Promise<Array>} - Array de productos principales
   */
  static async getProductsByAccessory(accessoryProductId) {
    try {
      const accessories = await Accessory.findAll({
        where: {
          accessory_product_id: parseInt(accessoryProductId)
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

      return accessories.map(acc => ({
        id: acc.id,
        mainProduct: acc.mainProduct
      }));

    } catch (error) {
      logger.error('Error en AccessoryService.getProductsByAccessory:', error);
      throw error;
    }
  }

  /**
   * Verifica si dos productos están relacionados como accesorio
   * @param {number} mainProductId - ID del producto principal
   * @param {number} accessoryProductId - ID del producto accesorio
   * @returns {Promise<boolean>} - true si están relacionados
   */
  static async areProductsRelated(mainProductId, accessoryProductId) {
    try {
      const accessory = await Accessory.findOne({
        where: {
          main_product_id: mainProductId,
          accessory_product_id: accessoryProductId
        }
      });

      return !!accessory;

    } catch (error) {
      logger.error('Error en AccessoryService.areProductsRelated:', error);
      throw error;
    }
  }
}

module.exports = AccessoryService;
