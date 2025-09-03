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
    
    // Validar que el ID sea válido
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: "ID de producto inválido"
      });
    }
    
    // Limpiar datos antes de enviar al servicio
    const cleanedData = { ...productData };
    
    // Convertir campos vacíos a null para campos opcionales
    const optionalFields = ['brand_id', 'category_id', 'subcategory_id', 'description', 'short_description', 'main_image', 'dimensions', 'voltaje', 'frame_size'];
    optionalFields.forEach(field => {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      }
    });
    
    // Convertir campos numéricos vacíos a null
    const numericFields = ['price', 'stock_quantity', 'min_stock_level', 'weight', 'potencia_kw'];
    numericFields.forEach(field => {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      }
    });
    
    const product = await ProductService.updateProduct(productId, cleanedData);
    
    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: product
    });
  } catch (error) {
    console.log('Error en updateProduct controller:', error);
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

// Exportar productos con todas sus relaciones
const exportProductsWithRelations = async (req, res, next) => {
  try {
    console.log('Exportando productos con relaciones...');
    const products = await ProductService.exportProductsWithRelations();
    console.log(`Exportación completada: ${products.length} productos`);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error exportando productos con relaciones:', error);
    next(error);
  }
};

// Limpiar todos los productos (soft delete)
const clearAllProducts = async (req, res, next) => {
  try {
    console.log('Iniciando limpieza de todos los productos...');
    const result = await ProductService.clearAllProducts();
    console.log(`Limpieza completada: ${result.deleted_count} productos eliminados`);
    
    res.json({
      success: true,
      message: `Se eliminaron ${result.deleted_count} productos del sistema`,
      data: {
        deleted_count: result.deleted_count,
        deleted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error limpiando productos:', error);
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
  getProductStats,
  exportProductsWithRelations,
  clearAllProducts
}; 