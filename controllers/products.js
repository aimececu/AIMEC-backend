const ProductService = require('../services/ProductService');

// =====================================================
// MÉTODOS BÁSICOS DE PRODUCTOS
// =====================================================

// Obtener todos los productos
const getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
      brand_id: req.query.brand_id ? parseInt(req.query.brand_id) : null,
      subcategory_id: req.query.subcategory_id ? parseInt(req.query.subcategory_id) : null,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
      in_stock: req.query.in_stock === 'true',
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };

    const result = await ProductService.getAllProducts(filters);
    
    res.json({
      success: true,
      data: result.products || [],
      pagination: {
        total: result.total || 0,
        limit: result.limit || null,
        offset: result.offset || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    // En caso de error, devolver array vacío en lugar de fallar
    res.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        limit: null,
        offset: 0
      }
    });
  }
};

// Obtener producto por ID
const getProductById = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await ProductService.getProductById(productId);
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Crear producto
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    const product = await ProductService.createProduct(productData);
    
    res.status(201).json({
      success: true,
      message: "Producto creado correctamente",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar producto
const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    const product = await ProductService.updateProduct(productId, productData);
    
    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto
const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await ProductService.deleteProduct(productId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// Buscar productos
const searchProducts = async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'q' es requerido para la búsqueda"
      });
    }

    const filters = {
      limit: limit ? parseInt(limit) : null
    };

    const result = await ProductService.searchProducts(q, filters);
    
    res.json({
      success: true,
      data: result.products,
      total: result.total,
      searchTerm: result.searchTerm
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos por categoría
const getProductsByCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const products = await ProductService.getProductsByCategory(categoryId, limit);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos por marca
const getProductsByBrand = async (req, res, next) => {
  try {
    const brandId = parseInt(req.params.brandId);
    const products = await ProductService.getProductsByBrand(brandId);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de productos
const getProductStats = async (req, res, next) => {
  try {
    console.log('Obteniendo estadísticas de productos...');
    const stats = await ProductService.getProductStats();
    console.log('Estadísticas obtenidas:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductStats
}; 