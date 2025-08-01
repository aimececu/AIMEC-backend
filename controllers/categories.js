const categoryQueries = require('../database/queries/categories');

// =====================================================
// CONTROLADOR DE CATEGORÍAS
// =====================================================

// Obtener todas las categorías
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryQueries.getAllCategories();
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener categoría por ID
const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryQueries.getCategoryById(parseInt(req.params.id));
    
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
        error: "Nombre de categoría es requerido"
      });
    }

    const category = await categoryQueries.createCategory(categoryData);
    
    res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar categoría
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    const updateData = req.body;

    // Verificar que la categoría existe
    const existingCategory = await categoryQueries.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: "Categoría no encontrada"
      });
    }

    const category = await categoryQueries.updateCategory(categoryId, updateData);
    
    res.json({
      success: true,
      message: "Categoría actualizada exitosamente",
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar categoría
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Verificar que la categoría existe
    const existingCategory = await categoryQueries.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: "Categoría no encontrada"
      });
    }

    const category = await categoryQueries.deleteCategory(categoryId);
    
    res.json({
      success: true,
      message: "Categoría eliminada exitosamente",
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CONTROLADOR DE SUBCATEGORÍAS
// =====================================================

// Obtener subcategorías por categoría
const getSubcategoriesByCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const subcategories = await categoryQueries.getSubcategoriesByCategory(categoryId);
    
    res.json({
      success: true,
      data: subcategories,
      count: subcategories.length,
      categoryId
    });
  } catch (error) {
    next(error);
  }
};

// Obtener subcategoría por ID
const getSubcategoryById = async (req, res, next) => {
  try {
    const subcategory = await categoryQueries.getSubcategoryById(parseInt(req.params.id));
    
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada"
      });
    }

    res.json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva subcategoría
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

    const subcategory = await categoryQueries.createSubcategory(subcategoryData);
    
    res.status(201).json({
      success: true,
      message: "Subcategoría creada exitosamente",
      data: subcategory
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar subcategoría
const updateSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = parseInt(req.params.id);
    const updateData = req.body;

    // Verificar que la subcategoría existe
    const existingSubcategory = await categoryQueries.getSubcategoryById(subcategoryId);
    if (!existingSubcategory) {
      return res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada"
      });
    }

    const subcategory = await categoryQueries.updateSubcategory(subcategoryId, updateData);
    
    res.json({
      success: true,
      message: "Subcategoría actualizada exitosamente",
      data: subcategory
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar subcategoría
const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = parseInt(req.params.id);

    // Verificar que la subcategoría existe
    const existingSubcategory = await categoryQueries.getSubcategoryById(subcategoryId);
    if (!existingSubcategory) {
      return res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada"
      });
    }

    const subcategory = await categoryQueries.deleteSubcategory(subcategoryId);
    
    res.json({
      success: true,
      message: "Subcategoría eliminada exitosamente",
      data: subcategory
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
    const brands = await categoryQueries.getAllBrands();
    res.json({
      success: true,
      data: brands,
      count: brands.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener marca por ID
const getBrandById = async (req, res, next) => {
  try {
    const brand = await categoryQueries.getBrandById(parseInt(req.params.id));
    
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
    const brandData = req.body;
    
    // Validaciones básicas
    if (!brandData.name) {
      return res.status(400).json({
        success: false,
        error: "Nombre de marca es requerido"
      });
    }

    const brand = await categoryQueries.createBrand(brandData);
    
    res.status(201).json({
      success: true,
      message: "Marca creada exitosamente",
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar marca
const updateBrand = async (req, res, next) => {
  try {
    const brandId = parseInt(req.params.id);
    const updateData = req.body;

    // Verificar que la marca existe
    const existingBrand = await categoryQueries.getBrandById(brandId);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: "Marca no encontrada"
      });
    }

    const brand = await categoryQueries.updateBrand(brandId, updateData);
    
    res.json({
      success: true,
      message: "Marca actualizada exitosamente",
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar marca
const deleteBrand = async (req, res, next) => {
  try {
    const brandId = parseInt(req.params.id);

    // Verificar que la marca existe
    const existingBrand = await categoryQueries.getBrandById(brandId);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: "Marca no encontrada"
      });
    }

    const brand = await categoryQueries.deleteBrand(brandId);
    
    res.json({
      success: true,
      message: "Marca eliminada exitosamente",
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CONTROLADOR DE SERIES DE PRODUCTOS
// =====================================================

// Obtener series de productos
const getProductSeries = async (req, res, next) => {
  try {
    const filters = {
      brand_id: req.query.brand_id ? parseInt(req.query.brand_id) : null,
      category_id: req.query.category_id ? parseInt(req.query.category_id) : null
    };

    const series = await categoryQueries.getProductSeries(filters);
    res.json({
      success: true,
      data: series,
      count: series.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener serie por ID
const getProductSeriesById = async (req, res, next) => {
  try {
    const series = await categoryQueries.getProductSeriesById(parseInt(req.params.id));
    
    if (!series) {
      return res.status(404).json({
        success: false,
        error: "Serie de productos no encontrada"
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
    const seriesData = req.body;
    
    // Validaciones básicas
    if (!seriesData.name || !seriesData.brand_id || !seriesData.category_id) {
      return res.status(400).json({
        success: false,
        error: "Nombre, marca y categoría son requeridos"
      });
    }

    const series = await categoryQueries.createProductSeries(seriesData);
    
    res.status(201).json({
      success: true,
      message: "Serie de productos creada exitosamente",
      data: series
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar serie
const updateProductSeries = async (req, res, next) => {
  try {
    const seriesId = parseInt(req.params.id);
    const updateData = req.body;

    // Verificar que la serie existe
    const existingSeries = await categoryQueries.getProductSeriesById(seriesId);
    if (!existingSeries) {
      return res.status(404).json({
        success: false,
        error: "Serie de productos no encontrada"
      });
    }

    const series = await categoryQueries.updateProductSeries(seriesId, updateData);
    
    res.json({
      success: true,
      message: "Serie de productos actualizada exitosamente",
      data: series
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar serie
const deleteProductSeries = async (req, res, next) => {
  try {
    const seriesId = parseInt(req.params.id);

    // Verificar que la serie existe
    const existingSeries = await categoryQueries.getProductSeriesById(seriesId);
    if (!existingSeries) {
      return res.status(404).json({
        success: false,
        error: "Serie de productos no encontrada"
      });
    }

    const series = await categoryQueries.deleteProductSeries(seriesId);
    
    res.json({
      success: true,
      message: "Serie de productos eliminada exitosamente",
      data: series
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
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  
  // Marcas
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  
  // Series de Productos
  getProductSeries,
  getProductSeriesById,
  createProductSeries,
  updateProductSeries,
  deleteProductSeries
}; 