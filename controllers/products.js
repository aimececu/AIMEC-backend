const ProductService = require('../services/ProductService');

// =====================================================
// CONTROLADOR DE PRODUCTOS
// =====================================================

// Obtener todos los productos con filtros
const getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
      brand_id: req.query.brand_id ? parseInt(req.query.brand_id) : null,
      subcategory_id: req.query.subcategory_id ? parseInt(req.query.subcategory_id) : null,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
      featured: req.query.featured === 'true',
      in_stock: req.query.in_stock === 'true',
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };

    const result = await ProductService.getAllProducts(filters);
    
    res.json({
      success: true,
      data: result.products,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.products.length < result.total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener producto por ID
const getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Obtener producto por slug
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await ProductService.getProductBySlug(req.params.slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Crear nuevo producto
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    
    // Validaciones básicas
    if (!productData.sku || !productData.name || !productData.price) {
      return res.status(400).json({
        success: false,
        error: "SKU, nombre y precio son requeridos"
      });
    }

    const product = await ProductService.createProduct(productData);
    
    res.status(201).json({
      success: true,
      data: product,
      message: "Producto creado correctamente"
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
      data: product,
      message: "Producto actualizado correctamente"
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
    const { q, category_id, brand_id, min_price, max_price, limit, offset } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: "El término de búsqueda es requerido"
      });
    }

    const filters = {
      category_id: category_id ? parseInt(category_id) : null,
      brand_id: brand_id ? parseInt(brand_id) : null,
      min_price: min_price ? parseFloat(min_price) : null,
      max_price: max_price ? parseFloat(max_price) : null,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null
    };

    const result = await ProductService.searchProducts(q, filters);
    
    res.json({
      success: true,
      data: result.products,
      searchTerm: result.searchTerm,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + result.products.length < result.total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos destacados
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const products = await ProductService.getFeaturedProducts(limit);
    
    res.json({
      success: true,
      data: products
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
    const stats = await ProductService.getProductStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MÉTODOS DE APLICACIONES DE PRODUCTOS
// =====================================================

// Obtener aplicaciones de un producto
const getProductApplications = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const applications = await ProductService.getProductApplications(productId);
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Asignar aplicaciones a un producto
const assignApplicationsToProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const { application_ids } = req.body;
    
    if (!application_ids || !Array.isArray(application_ids)) {
      return res.status(400).json({
        success: false,
        error: "application_ids es requerido y debe ser un array"
      });
    }

    const result = await ProductService.assignApplicationsToProduct(productId, application_ids);
    
    res.json({
      success: true,
      message: "Aplicaciones asignadas correctamente",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MÉTODOS DE CARACTERÍSTICAS DE PRODUCTOS
// =====================================================

// Obtener características de un producto
const getProductFeatures = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const features = await ProductService.getProductFeatures(productId);
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    next(error);
  }
};

// Agregar característica a un producto
const addProductFeature = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const { feature_id, value, unit } = req.body;
    
    if (!feature_id) {
      return res.status(400).json({
        success: false,
        error: "feature_id es requerido"
      });
    }

    const feature = await ProductService.addProductFeature(productId, { feature_id, value, unit });
    
    res.status(201).json({
      success: true,
      message: "Característica agregada correctamente",
      data: feature
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar característica de un producto
const updateProductFeature = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const featureId = parseInt(req.params.featureId);
    const { value, unit } = req.body;

    const feature = await ProductService.updateProductFeature(productId, featureId, { value, unit });
    
    res.json({
      success: true,
      message: "Característica actualizada correctamente",
      data: feature
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar característica de un producto
const deleteProductFeature = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const featureId = parseInt(req.params.featureId);
    
    await ProductService.deleteProductFeature(productId, featureId);
    
    res.json({
      success: true,
      message: "Característica eliminada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MÉTODOS DE PRODUCTOS RELACIONADOS
// =====================================================

// Obtener productos relacionados
const getProductRelated = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const related = await ProductService.getProductRelated(productId);
    
    res.json({
      success: true,
      data: related
    });
  } catch (error) {
    next(error);
  }
};

// Agregar producto relacionado
const addProductRelated = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const { related_product_id } = req.body;
    
    if (!related_product_id) {
      return res.status(400).json({
        success: false,
        error: "related_product_id es requerido"
      });
    }

    const related = await ProductService.addProductRelated(productId, related_product_id);
    
    res.status(201).json({
      success: true,
      message: "Producto relacionado agregado correctamente",
      data: related
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar producto relacionado
const updateProductRelated = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const relatedId = parseInt(req.params.relatedId);
    const { related_product_id } = req.body;

    const related = await ProductService.updateProductRelated(productId, relatedId, related_product_id);
    
    res.json({
      success: true,
      message: "Producto relacionado actualizado correctamente",
      data: related
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto relacionado
const deleteProductRelated = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const relatedId = parseInt(req.params.relatedId);
    
    await ProductService.deleteProductRelated(productId, relatedId);
    
    res.json({
      success: true,
      message: "Producto relacionado eliminado correctamente"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductStats,
  // Métodos de aplicaciones
  getProductApplications,
  assignApplicationsToProduct,
  // Métodos de características
  getProductFeatures,
  addProductFeature,
  updateProductFeature,
  deleteProductFeature,
  // Métodos de productos relacionados
  getProductRelated,
  addProductRelated,
  updateProductRelated,
  deleteProductRelated
}; 