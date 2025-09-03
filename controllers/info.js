const ProductService = require("../services/ProductService");
const CategoryService = require("../services/CategoryService");
const BrandService = require("../services/BrandService");

// Obtener estadísticas generales del sistema
const getSystemStats = async (req, res, next) => {
  try {
    // Obtener estadísticas de productos
    const totalProducts = await ProductService.getProductCount();

    // Obtener estadísticas de marcas
    const totalBrands = await BrandService.getBrandCount();

    // Obtener estadísticas de categorías y subcategorías
    const categoryStats = await CategoryService.getCategoryStats();


    const stats = {
      total_products: totalProducts,
      total_brands: totalBrands,
      total_categories: categoryStats.totalCategories,
      total_subcategories: categoryStats.totalSubcategories,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas del sistema:", error);
    console.error("Stack trace:", error.stack);
    next(error);
  }
};

module.exports = {
  getSystemStats,
};
