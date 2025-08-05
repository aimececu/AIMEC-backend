const CategoryService = require('../services/CategoryService');

// =====================================================
// CONTROLADOR DE CATEGORÍAS
// =====================================================

// Obtener todas las categorías
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryService.getAllCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Obtener categoría por ID
const getCategoryById = async (req, res, next) => {
  try {
    const category = await CategoryService.getCategoryById(parseInt(req.params.id));
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Categoría no encontrada"
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva categoría
const createCategory = async (req, res, next) => {
  try {
    const categoryData = req.body;
    
    // Validaciones básicas
    if (!categoryData.name) {
      return res.status(400).json({
        success: false,
        error: "Nombre es requerido"
      });
    }

    const category = await CategoryService.createCategory(categoryData);
    
    res.status(201).json({
      success: true,
      data: category,
      message: "Categoría creada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar categoría
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    const categoryData = req.body;

    const category = await CategoryService.updateCategory(categoryId, categoryData);
    
    res.json({
      success: true,
      data: category,
      message: "Categoría actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar categoría
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    const result = await CategoryService.deleteCategory(categoryId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CONTROLADOR DE SUBCATEGORÍAS
// =====================================================

// Obtener subcategorías de una categoría
const getSubcategoriesByCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const subcategories = await CategoryService.getSubcategoriesByCategory(categoryId);
    
    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    next(error);
  }
};

// Crear subcategoría
const createSubcategory = async (req, res, next) => {
  try {
    const subcategoryData = req.body;
    
    // Validaciones básicas
    if (!subcategoryData.name || !subcategoryData.category_id) {
      return res.status(400).json({
        success: false,
        error: "Nombre y categoría padre son requeridos"
      });
    }

    const subcategory = await CategoryService.createSubcategory(subcategoryData);
    
    res.status(201).json({
      success: true,
      data: subcategory,
      message: "Subcategoría creada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar subcategoría
const updateSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = parseInt(req.params.id);
    const subcategoryData = req.body;

    const subcategory = await CategoryService.updateSubcategory(subcategoryId, subcategoryData);
    
    res.json({
      success: true,
      data: subcategory,
      message: "Subcategoría actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar subcategoría
const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = parseInt(req.params.id);
    
    const result = await CategoryService.deleteSubcategory(subcategoryId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CONTROLADOR DE MARCAS
// =====================================================

// Obtener todas las marcas
const getAllBrands = async (req, res, next) => {
  try {
    const { Brand } = require('../models');
    
    const brands = await Brand.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
};

// Obtener marca por ID
const getBrandById = async (req, res, next) => {
  try {
    const { Brand, Product } = require('../models');
    
    const brand = await Brand.findByPk(parseInt(req.params.id), {
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
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Marca no encontrada"
      });
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva marca
const createBrand = async (req, res, next) => {
  try {
    const { Brand } = require('../models');
    const brandData = req.body;
    
    // Validaciones básicas
    if (!brandData.name) {
      return res.status(400).json({
        success: false,
        error: "Nombre es requerido"
      });
    }

    const brand = await Brand.create(brandData);
    
    res.status(201).json({
      success: true,
      data: brand,
      message: "Marca creada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar marca
const updateBrand = async (req, res, next) => {
  try {
    const { Brand } = require('../models');
    const brandId = parseInt(req.params.id);
    const brandData = req.body;

    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Marca no encontrada"
      });
    }

    await brand.update(brandData);
    
    res.json({
      success: true,
      data: brand,
      message: "Marca actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar marca
const deleteBrand = async (req, res, next) => {
  try {
    const { Brand, Product } = require('../models');
    const brandId = parseInt(req.params.id);

    const brand = await Brand.findByPk(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: "Marca no encontrada"
      });
    }

    // Verificar si tiene productos asociados
    const productCount = await Product.count({
      where: { brand_id: brandId, is_active: true }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: "No se puede eliminar una marca que tiene productos asociados"
      });
    }

    await brand.update({ is_active: false });
    
    res.json({
      success: true,
      message: "Marca eliminada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CONTROLADOR DE SERIES
// =====================================================

// Obtener todas las series
const getAllSeries = async (req, res, next) => {
  try {
    const { ProductSeries, Brand } = require('../models');
    
    const series = await ProductSeries.findAll({
      where: { is_active: true },
      include: [
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: series
    });
  } catch (error) {
    next(error);
  }
};

// Obtener serie por ID
const getProductSeriesById = async (req, res, next) => {
  try {
    const { ProductSeries, Brand } = require('../models');
    
    const series = await ProductSeries.findByPk(parseInt(req.params.id), {
      include: [
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!series) {
      return res.status(404).json({
        success: false,
        error: "Serie no encontrada"
      });
    }

    res.json({
      success: true,
      data: series
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva serie
const createProductSeries = async (req, res, next) => {
  try {
    const { ProductSeries } = require('../models');
    const seriesData = req.body;
    
    // Validaciones básicas
    if (!seriesData.name || !seriesData.brand_id) {
      return res.status(400).json({
        success: false,
        error: "Nombre y marca son requeridos"
      });
    }

    const series = await ProductSeries.create(seriesData);
    
    res.status(201).json({
      success: true,
      data: series,
      message: "Serie creada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar serie
const updateProductSeries = async (req, res, next) => {
  try {
    const { ProductSeries } = require('../models');
    const seriesId = parseInt(req.params.id);
    const seriesData = req.body;

    const series = await ProductSeries.findByPk(seriesId);
    
    if (!series) {
      return res.status(404).json({
        success: false,
        error: "Serie no encontrada"
      });
    }

    await series.update(seriesData);
    
    res.json({
      success: true,
      data: series,
      message: "Serie actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar serie
const deleteProductSeries = async (req, res, next) => {
  try {
    const { ProductSeries, Product } = require('../models');
    const seriesId = parseInt(req.params.id);

    const series = await ProductSeries.findByPk(seriesId);
    
    if (!series) {
      return res.status(404).json({
        success: false,
        error: "Serie no encontrada"
      });
    }

    // Verificar si tiene productos asociados
    const productCount = await Product.count({
      where: { series_id: seriesId, is_active: true }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: "No se puede eliminar una serie que tiene productos asociados"
      });
    }

    await series.update({ is_active: false });
    
    res.json({
      success: true,
      message: "Serie eliminada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas
const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await CategoryService.getCategoryStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Categorías
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Subcategorías
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  
  // Marcas
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  
  // Series
  getAllSeries,
  getProductSeriesById,
  createProductSeries,
  updateProductSeries,
  deleteProductSeries,
  
  // Estadísticas
  getCategoryStats
}; 