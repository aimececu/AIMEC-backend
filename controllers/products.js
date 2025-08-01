const productQueries = require('../database/queries/products');
const specificationQueries = require('../database/queries/specifications');

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

    const products = await productQueries.getAllProducts(filters);
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener producto por ID
const getProductById = async (req, res, next) => {
  try {
    const product = await productQueries.getProductById(parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    // Obtener especificaciones del producto
    const specifications = await specificationQueries.getProductSpecificationsComplete(product.id);
    
    res.json({
      success: true,
      data: {
        ...product,
        specifications
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener producto por slug
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productQueries.getProductBySlug(req.params.slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    // Obtener especificaciones del producto
    const specifications = await specificationQueries.getProductSpecificationsComplete(product.id);
    
    res.json({
      success: true,
      data: {
        ...product,
        specifications
      }
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

    const product = await productQueries.createProduct(productData);
    
    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
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
    const updateData = req.body;

    // Verificar que el producto existe
    const existingProduct = await productQueries.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    const product = await productQueries.updateProduct(productId, updateData);
    
    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto (soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);

    // Verificar que el producto existe
    const existingProduct = await productQueries.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Producto no encontrado"
      });
    }

    const product = await productQueries.deleteProduct(productId);
    
    res.json({
      success: true,
      message: "Producto eliminado exitosamente",
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Buscar productos
const searchProducts = async (req, res, next) => {
  try {
    const { q, category_id, brand_id, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Término de búsqueda requerido"
      });
    }

    const filters = {
      category_id: category_id ? parseInt(category_id) : null,
      brand_id: brand_id ? parseInt(brand_id) : null,
      limit: limit ? parseInt(limit) : 20
    };

    const products = await productQueries.searchProducts(q, filters);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      searchTerm: q
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos destacados
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const products = await productQueries.getFeaturedProducts(limit);
    
    res.json({
      success: true,
      data: products,
      count: products.length
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
    
    const products = await productQueries.getProductsByCategory(categoryId, limit);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      categoryId
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos por marca
const getProductsByBrand = async (req, res, next) => {
  try {
    const brandId = parseInt(req.params.brandId);
    const products = await productQueries.getProductsByBrand(brandId);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      brandId
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de productos
const getProductStats = async (req, res, next) => {
  try {
    const stats = await productQueries.getProductStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Filtrar productos por especificación
const getProductsBySpecification = async (req, res, next) => {
  try {
    const { specificationTypeId, value, dataType } = req.query;
    
    if (!specificationTypeId || !value || !dataType) {
      return res.status(400).json({
        success: false,
        error: "ID de especificación, valor y tipo de dato son requeridos"
      });
    }

    const products = await specificationQueries.getProductsBySpecification(
      parseInt(specificationTypeId),
      value,
      dataType
    );
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      filter: { specificationTypeId, value, dataType }
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
  getProductsBySpecification
}; 