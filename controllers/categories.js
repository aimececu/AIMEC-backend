const CategoryService = require('../services/CategoryService');
const BrandService = require('../services/BrandService');

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
    const categoryId = parseInt(req.params.id);
    const category = await CategoryService.getCategoryById(categoryId);
    
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
    console.log('=== ELIMINANDO CATEGORÍA ===');
    console.log('Category ID:', categoryId);
    console.log('Request params:', req.params);
    
    const result = await CategoryService.deleteCategory(categoryId);
    console.log('Resultado de eliminación:', result);
    
    res.json({
      success: true,
      message: "Categoría eliminada correctamente"
    });
  } catch (error) {
    console.error('Error en deleteCategory:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// =====================================================
// CONTROLADOR DE SUBCATEGORÍAS
// =====================================================

// Obtener todas las subcategorías
const getAllSubcategories = async (req, res, next) => {
  try {
    const subcategories = await CategoryService.getAllSubcategories();
    
    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    next(error);
  }
};

// Obtener subcategoría por ID
const getSubcategoryById = async (req, res, next) => {
  try {
    const subcategoryId = parseInt(req.params.id);
    const subcategory = await CategoryService.getSubcategoryById(subcategoryId);
    
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
    await CategoryService.deleteSubcategory(subcategoryId);
    
    res.json({
      success: true,
      message: "Subcategoría eliminada correctamente"
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
    const brands = await BrandService.getAllBrands();
    
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
    const brandId = parseInt(req.params.id);
    const brand = await BrandService.getBrandById(brandId);
    
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
    const brand = await BrandService.createBrand(brandData);
    
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
    const brandId = parseInt(req.params.id);
    const brandData = req.body;
    
    const brand = await BrandService.updateBrand(brandId, brandData);
    
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
    const brandId = parseInt(req.params.id);
    await BrandService.deleteBrand(brandId);
    
    res.json({
      success: true,
      message: "Marca eliminada correctamente"
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
  getAllSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  
  // Marcas
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
}; 