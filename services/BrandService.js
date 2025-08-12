const { Brand, Product } = require('../models');

class BrandService {
  // Obtener todas las marcas
  async getAllBrands() {
    try {
      const brands = await Brand.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      return brands;
    } catch (error) {
      throw new Error(`Error al obtener marcas: ${error.message}`);
    }
  }

  // Obtener marca por ID
  async getBrandById(id) {
    try {
      const brand = await Brand.findByPk(id, {
        include: [
          {
            model: Product,
            as: 'products',
            where: { is_active: true },
            required: false,
            attributes: ['id', 'name', 'sku', 'price', 'main_image'],
            limit: 10
          }
        ]
      });

      return brand;
    } catch (error) {
      throw new Error(`Error al obtener marca: ${error.message}`);
    }
  }

  // Crear nueva marca
  async createBrand(brandData) {
    try {
      const brand = await Brand.create(brandData);
      return brand;
    } catch (error) {
      throw new Error(`Error al crear marca: ${error.message}`);
    }
  }

  // Actualizar marca
  async updateBrand(id, brandData) {
    try {
      const brand = await Brand.findByPk(id);
      if (!brand) {
        throw new Error('Marca no encontrada');
      }

      await brand.update(brandData);
      return brand;
    } catch (error) {
      throw new Error(`Error al actualizar marca: ${error.message}`);
    }
  }

  // Eliminar marca (soft delete)
  async deleteBrand(id) {
    try {
      const brand = await Brand.findByPk(id);
      if (!brand) {
        throw new Error('Marca no encontrada');
      }

      await brand.update({ is_active: false });
      return { message: 'Marca eliminada correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar marca: ${error.message}`);
    }
  }

  // Obtener solo el conteo de marcas
  async getBrandCount() {
    try {
      return await Brand.count({
        where: { is_active: true }
      });
    } catch (error) {
      throw new Error(`Error al contar marcas: ${error.message}`);
    }
  }
}

module.exports = new BrandService();
