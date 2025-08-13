const { Category, Subcategory, Product, Brand } = require('../models');
const { Op } = require('sequelize');

class CategoryService {
  // Obtener todas las categorías
  async getAllCategories() {
    try {
      const categories = await Category.findAll({
        where: { is_active: true },
        include: [
          {
            model: Subcategory,
            as: 'subcategories',
            where: { is_active: true },
            required: false,
            attributes: ['id', 'name']
          }
        ],
        order: [
          ['name', 'ASC'],
          [{ model: Subcategory, as: 'subcategories' }, 'name', 'ASC']
        ]
      });

      return categories;
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  // Obtener categoría por ID
  async getCategoryById(id) {
    try {
      const category = await Category.findByPk(id, {
        include: [
          {
            model: Subcategory,
            as: 'subcategories',
            where: { is_active: true },
            required: false,
            attributes: ['id', 'name', 'description']
          },
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

      return category;
    } catch (error) {
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
  }

  // Obtener categoría por slug (deshabilitado - no hay columna slug)
  // async getCategoryBySlug(slug) {
  //   try {
  //     const category = await Category.findOne({
  //       where: { slug, is_active: true },
  //       include: [
  //         {
  //           model: Subcategory,
  //           as: 'subcategories',
  //           where: { is_active: true },
  //           required: false,
  //           attributes: ['id', 'name', 'image', 'description']
  //         }
  //       ]
  //     });

  //     return category;
  //   } catch (error) {
  //     throw new Error(`Error al obtener categoría por slug: ${error.message}`);
  //   }
  // }

  // Crear nueva categoría
  async createCategory(categoryData) {
    try {
      // Remover slug si existe en los datos
      delete categoryData.slug;

      const category = await Category.create(categoryData);
      return category;
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
  }

  // Actualizar categoría
  async updateCategory(id, categoryData) {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Remover slug si existe en los datos
      delete categoryData.slug;

      await category.update(categoryData);
      return category;
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
  }

  // Eliminar categoría (soft delete)
  async deleteCategory(id) {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si tiene productos asociados
      const productCount = await Product.count({
        where: { category_id: id, is_active: true }
      });

      if (productCount > 0) {
        throw new Error('No se puede eliminar una categoría que tiene productos asociados');
      }

      await category.update({ is_active: false });
      return { message: 'Categoría eliminada correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }

  // Obtener subcategorías de una categoría
  async getSubcategoriesByCategory(categoryId) {
    try {
      const subcategories = await Subcategory.findAll({
        where: { category_id: categoryId, is_active: true },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description', 'icon', 'color']
          }
        ],
        order: [['name', 'ASC']]
      });

      return subcategories;
    } catch (error) {
      throw new Error(`Error al obtener subcategorías: ${error.message}`);
    }
  }

  // Crear subcategoría
  async createSubcategory(subcategoryData) {
    try {
      // Validar que la categoría padre existe
      const parentCategory = await Category.findByPk(subcategoryData.category_id);
      if (!parentCategory) {
        throw new Error('La categoría padre no existe');
      }

      // Remover slug si existe en los datos
      delete subcategoryData.slug;

      const subcategory = await Subcategory.create(subcategoryData);
      return subcategory;
    } catch (error) {
      throw new Error(`Error al crear subcategoría: ${error.message}`);
    }
  }

  // Actualizar subcategoría
  async updateSubcategory(id, subcategoryData) {
    try {
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) {
        throw new Error('Subcategoría no encontrada');
      }

      // Remover slug si existe en los datos
      delete subcategoryData.slug;

      await subcategory.update(subcategoryData);
      return subcategory;
    } catch (error) {
      throw new Error(`Error al actualizar subcategoría: ${error.message}`);
    }
  }

  // Eliminar subcategoría (soft delete)
  async deleteSubcategory(id) {
    try {
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) {
        throw new Error('Subcategoría no encontrada');
      }

      // Verificar si tiene productos asociados
      const productCount = await Product.count({
        where: { subcategory_id: id, is_active: true }
      });

      if (productCount > 0) {
        throw new Error('No se puede eliminar una subcategoría que tiene productos asociados');
      }

      await subcategory.update({ is_active: false });
      return { message: 'Subcategoría eliminada correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar subcategoría: ${error.message}`);
    }
  }

  // Obtener estadísticas de categorías
  async getCategoryStats() {
    try {
      const totalCategories = await Category.count({ where: { is_active: true } });
      const totalSubcategories = await Subcategory.count({ where: { is_active: true } });
      
      const categoriesWithProducts = await Category.findAll({
        where: { is_active: true },
        include: [
          {
            model: Product,
            as: 'products',
            where: { is_active: true },
            required: false,
            attributes: []
          }
        ],
        attributes: ['id', 'name'],
        group: ['Category.id']
      });

      return {
        totalCategories,
        totalSubcategories,
        categoriesWithProducts: categoriesWithProducts.length
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas de categorías: ${error.message}`);
    }
  }

  // Obtener todas las subcategorías
  async getAllSubcategories() {
    try {
      const subcategories = await Subcategory.findAll({
        where: { is_active: true },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description']
          }
        ],
        order: [['name', 'ASC']]
      });

      return subcategories;
    } catch (error) {
      throw new Error(`Error al obtener subcategorías: ${error.message}`);
    }
  }

  // Obtener todas las marcas
  async getAllBrands() {
    try {
      // Brand ya está importado al inicio del archivo
      
      const brands = await Brand.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      return brands;
    } catch (error) {
      throw new Error(`Error al obtener marcas: ${error.message}`);
    }
  }

  // Obtener subcategorías por ID de categoría
  async getSubcategoriesByCategoryId(categoryId) {
    try {
      const subcategories = await Subcategory.findAll({
        where: {
          category_id: categoryId,
          is_active: true
        },
        order: [['name', 'ASC']]
      });

      return subcategories;
    } catch (error) {
      throw new Error(`Error al obtener subcategorías: ${error.message}`);
    }
  }

  // Obtener subcategoría por ID
  async getSubcategoryById(id) {
    try {
      const subcategory = await Subcategory.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      if (!subcategory) {
        return null;
      }

      return subcategory;
    } catch (error) {
      throw new Error(`Error al obtener subcategoría: ${error.message}`);
    }
  }

  // Obtener solo el conteo de categorías
  async getCategoryCount() {
    try {
      return await Category.count({
        where: { is_active: true }
      });
    } catch (error) {
      throw new Error(`Error al contar categorías: ${error.message}`);
    }
  }
}

module.exports = new CategoryService(); 