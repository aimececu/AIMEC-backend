const specificationQueries = require('../database/queries/specifications');

// =====================================================
// CONTROLADOR DE TIPOS DE ESPECIFICACIONES
// =====================================================

// Obtener tipos de especificaciones
const getSpecificationTypes = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
      data_type: req.query.data_type || null
    };

    const specTypes = await specificationQueries.getSpecificationTypes(filters);
    res.json({
      success: true,
      data: specTypes,
      count: specTypes.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener tipo de especificación por ID
const getSpecificationTypeById = async (req, res, next) => {
  try {
    const specType = await specificationQueries.getSpecificationTypeById(parseInt(req.params.id));
    
    if (!specType) {
      return res.status(404).json({
        success: false,
        error: "Tipo de especificación no encontrado"
      });
    }

    res.json({
      success: true,
      data: specType
    });
  } catch (error) {
    next(error);
  }
};

// Crear nuevo tipo de especificación
const createSpecificationType = async (req, res, next) => {
  try {
    const specTypeData = req.body;
    
    // Validaciones básicas
    if (!specTypeData.name || !specTypeData.display_name || !specTypeData.data_type) {
      return res.status(400).json({
        success: false,
        error: "Nombre, nombre de visualización y tipo de dato son requeridos"
      });
    }

    const specType = await specificationQueries.createSpecificationType(specTypeData);
    
    res.status(201).json({
      success: true,
      message: "Tipo de especificación creado exitosamente",
      data: specType
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar tipo de especificación
const updateSpecificationType = async (req, res, next) => {
  try {
    const specTypeId = parseInt(req.params.id);
    const updateData = req.body;

    // Verificar que el tipo de especificación existe
    const existingSpecType = await specificationQueries.getSpecificationTypeById(specTypeId);
    if (!existingSpecType) {
      return res.status(404).json({
        success: false,
        error: "Tipo de especificación no encontrado"
      });
    }

    const specType = await specificationQueries.updateSpecificationType(specTypeId, updateData);
    
    res.json({
      success: true,
      message: "Tipo de especificación actualizado exitosamente",
      data: specType
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar tipo de especificación
const deleteSpecificationType = async (req, res, next) => {
  try {
    const specTypeId = parseInt(req.params.id);

    // Verificar que el tipo de especificación existe
    const existingSpecType = await specificationQueries.getSpecificationTypeById(specTypeId);
    if (!existingSpecType) {
      return res.status(404).json({
        success: false,
        error: "Tipo de especificación no encontrado"
      });
    }

    const specType = await specificationQueries.deleteSpecificationType(specTypeId);
    
    res.json({
      success: true,
      message: "Tipo de especificación eliminado exitosamente",
      data: specType
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CONTROLADOR DE ESPECIFICACIONES DE PRODUCTOS
// =====================================================

// Obtener especificaciones de un producto
const getProductSpecifications = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const specifications = await specificationQueries.getProductSpecifications(productId);
    
    res.json({
      success: true,
      data: specifications,
      count: specifications.length,
      productId
    });
  } catch (error) {
    next(error);
  }
};

// Obtener especificación específica de un producto
const getProductSpecificationById = async (req, res, next) => {
  try {
    const specification = await specificationQueries.getProductSpecificationById(parseInt(req.params.id));
    
    if (!specification) {
      return res.status(404).json({
        success: false,
        error: "Especificación no encontrada"
      });
    }

    res.json({
      success: true,
      data: specification
    });
  } catch (error) {
    next(error);
  }
};

// Crear especificación para un producto
const createProductSpecification = async (req, res, next) => {
  try {
    const specData = req.body;
    
    // Validaciones básicas
    if (!specData.product_id || !specData.specification_type_id) {
      return res.status(400).json({
        success: false,
        error: "ID de producto y tipo de especificación son requeridos"
      });
    }

    const specification = await specificationQueries.createProductSpecification(specData);
    
    res.status(201).json({
      success: true,
      message: "Especificación creada exitosamente",
      data: specification
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar especificación de un producto
const updateProductSpecification = async (req, res, next) => {
  try {
    const specId = parseInt(req.params.id);
    const updateData = req.body;

    // Verificar que la especificación existe
    const existingSpec = await specificationQueries.getProductSpecificationById(specId);
    if (!existingSpec) {
      return res.status(404).json({
        success: false,
        error: "Especificación no encontrada"
      });
    }

    const specification = await specificationQueries.updateProductSpecification(specId, updateData);
    
    res.json({
      success: true,
      message: "Especificación actualizada exitosamente",
      data: specification
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar especificación de un producto
const deleteProductSpecification = async (req, res, next) => {
  try {
    const specId = parseInt(req.params.id);

    // Verificar que la especificación existe
    const existingSpec = await specificationQueries.getProductSpecificationById(specId);
    if (!existingSpec) {
      return res.status(404).json({
        success: false,
        error: "Especificación no encontrada"
      });
    }

    const specification = await specificationQueries.deleteProductSpecification(specId);
    
    res.json({
      success: true,
      message: "Especificación eliminada exitosamente",
      data: specification
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CONSULTAS MASIVAS Y ESPECIALIZADAS
// =====================================================

// Crear múltiples especificaciones para un producto
const createMultipleProductSpecifications = async (req, res, next) => {
  try {
    const { productId, specifications } = req.body;
    
    if (!productId || !specifications || !Array.isArray(specifications)) {
      return res.status(400).json({
        success: false,
        error: "ID de producto y array de especificaciones son requeridos"
      });
    }

    const createdSpecs = await specificationQueries.createMultipleProductSpecifications(productId, specifications);
    
    res.status(201).json({
      success: true,
      message: `${createdSpecs.length} especificaciones creadas exitosamente`,
      data: createdSpecs,
      count: createdSpecs.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener especificaciones por categoría
const getSpecificationsByCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const specifications = await specificationQueries.getSpecificationsByCategory(categoryId);
    
    res.json({
      success: true,
      data: specifications,
      count: specifications.length,
      categoryId
    });
  } catch (error) {
    next(error);
  }
};

// Obtener especificaciones completas de un producto (incluye tipos sin valores)
const getProductSpecificationsComplete = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const specifications = await specificationQueries.getProductSpecificationsComplete(productId);
    
    res.json({
      success: true,
      data: specifications,
      count: specifications.length,
      productId
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
  // Tipos de Especificaciones
  getSpecificationTypes,
  getSpecificationTypeById,
  createSpecificationType,
  updateSpecificationType,
  deleteSpecificationType,
  
  // Especificaciones de Productos
  getProductSpecifications,
  getProductSpecificationById,
  createProductSpecification,
  updateProductSpecification,
  deleteProductSpecification,
  
  // Consultas Masivas y Especializadas
  createMultipleProductSpecifications,
  getSpecificationsByCategory,
  getProductSpecificationsComplete,
  getProductsBySpecification
}; 