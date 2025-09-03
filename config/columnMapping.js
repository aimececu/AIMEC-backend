/**
 * Configuración de mapeo de columnas para importación de datos
 * Este archivo centraliza todas las variaciones de nombres de columnas
 * para facilitar el mantenimiento y la extensión
 */

const COLUMN_MAPPING = {
  // Mapeo de columnas de productos
  PRODUCT: {
    SKU: ['sku', 'SKU', 'Sku'],
    SKU_EC: ['sku_ec', 'SKU_EC', 'Sku_EC', 'sku ec', 'SKU EC'],
    NOMBRE: ['nombre', 'Nombre', 'NOMBRE', 'name', 'Name', 'NAME'],
    DESCRIPCION: ['descripcion', 'Descripción', 'descripcion', 'DESCRIPCION', 'description', 'Description', 'DESCRIPTION'],
    PRECIO: ['precio', 'Precio', 'PRECIO', 'price', 'Price', 'PRICE'],
    STOCK: ['stock', 'Stock', 'STOCK', 'cantidad', 'Cantidad', 'CANTIDAD'],
    STOCK_MINIMO: ['stock_minimo', 'Stock Mínimo', 'stock minimo', 'Stock Minimo', 'STOCK_MINIMO', 'min_stock', 'Min Stock'],
    PESO: ['peso', 'Peso', 'PESO', 'weight', 'Weight', 'WEIGHT'],
    DIMENSIONES: ['dimensiones', 'Dimensiones', 'DIMENSIONES', 'dimensions', 'Dimensions', 'DIMENSIONS'],
    IMAGEN: ['imagen', 'Imagen', 'IMAGEN', 'image', 'Image', 'IMAGE', 'foto', 'Foto', 'FOTO']
  },

  // Mapeo de columnas de marcas
  BRAND: {
    MARCA: ['marca', 'Marca', 'MARCA', 'brand', 'Brand', 'BRAND', 'fabricante', 'Fabricante', 'FABRICANTE']
  },

  // Mapeo de columnas de categorías
  CATEGORY: {
    CATEGORIA: ['categoria', 'Categoria', 'Categoría', 'CATEGORIA', 'category', 'Category', 'CATEGORY'],
    SUBCATEGORIA: ['subcategoria', 'Subcategoria', 'Subcategoría', 'SUBCATEGORIA', 'subcategory', 'Subcategory', 'SUBCATEGORY']
  },

  // Mapeo de columnas técnicas
  TECHNICAL: {
    POTENCIA_KW: ['potencia_kw', 'Potencia (kW)', 'potencia', 'Potencia', 'POTENCIA', 'power', 'Power', 'POWER', 'kw', 'KW'],
    VOLTAJE: ['voltaje', 'Voltaje', 'VOLTAJE', 'voltage', 'Voltage', 'VOLTAGE', 'v', 'V'],
    FRAME_SIZE: ['frame_size', 'Frame Size', 'frame', 'Frame', 'FRAME', 'tamaño', 'Tamaño', 'TAMAÑO'],
    CORRIENTE: ['corriente', 'Corriente', 'CORRIENTE', 'current', 'Current', 'CURRENT', 'amperios', 'Amperios', 'AMPERIOS', 'a', 'A'],
    COMUNICACION: ['comunicacion', 'Comunicación', 'COMUNICACION', 'communication', 'Communication', 'COMMUNICATION', 'protocolo', 'Protocolo', 'PROTOCOLO'],
    ALIMENTACION: ['alimentacion', 'Alimentacion', 'alimentación', 'Alimentación', 'ALIMENTACION', 'power_supply', 'Power Supply', 'POWER_SUPPLY', 'fuente', 'Fuente', 'FUENTE']
  },

  // Mapeo de columnas de características y aplicaciones
  FEATURES: {
    CARACTERISTICAS: ['caracteristicas', 'Características', 'caracteristicas', 'CARACTERISTICAS', 'features', 'Features', 'FEATURES', 'especificaciones', 'Especificaciones', 'ESPECIFICACIONES'],
    APLICACIONES: ['aplicaciones', 'Aplicaciones', 'aplicaciones', 'APLICACIONES', 'applications', 'Applications', 'APPLICATIONS', 'usos', 'Usos', 'USOS']
  },

  // Mapeo de columnas de relaciones
  RELATIONSHIPS: {
    ACCESORIOS: ['accesorios', 'Accesorios', 'ACCESORIOS', 'accesorios_compatibles', 'Accesorios compatibles', 'accessories', 'Accessories', 'ACCESSORIES', 'compatibles', 'Compatibles', 'COMPATIBLES'],
    PRODUCTOS_RELACIONADOS: ['productos_relacionados', 'Productos relacionados', 'equipos_relacionados', 'Equipos relacionados', 'related_products', 'Related Products', 'RELATED_PRODUCTS', 'relacionados', 'Relacionados', 'RELACIONADOS']
  }
};

/**
 * Función para mapear valores de columnas con diferentes variaciones
 * @param {Object} data - Objeto con los datos de la fila
 * @param {Array} possibleNames - Array de posibles nombres de columnas
 * @returns {*} El valor encontrado o null si no se encuentra
 */
const mapColumnValue = (data, possibleNames) => {
  for (const name of possibleNames) {
    if (data[name] !== undefined && data[name] !== null && data[name] !== '') {
      return data[name];
    }
  }
  return null;
};

/**
 * Función para obtener el mapeo de una columna específica
 * @param {string} category - Categoría de la columna (PRODUCT, BRAND, etc.)
 * @param {string} field - Campo específico (SKU, NOMBRE, etc.)
 * @returns {Array} Array de posibles nombres de columnas
 */
const getColumnMapping = (category, field) => {
  return COLUMN_MAPPING[category]?.[field] || [];
};

/**
 * Función para mapear un valor usando la configuración centralizada
 * @param {Object} data - Objeto con los datos de la fila
 * @param {string} category - Categoría de la columna
 * @param {string} field - Campo específico
 * @returns {*} El valor encontrado o null si no se encuentra
 */
const mapColumnValueByConfig = (data, category, field) => {
  const possibleNames = getColumnMapping(category, field);
  return mapColumnValue(data, possibleNames);
};

/**
 * Función para obtener todas las columnas soportadas
 * @returns {Object} Objeto con todas las columnas soportadas
 */
const getAllSupportedColumns = () => {
  const allColumns = {};
  
  Object.keys(COLUMN_MAPPING).forEach(category => {
    Object.keys(COLUMN_MAPPING[category]).forEach(field => {
      const key = `${category}_${field}`;
      allColumns[key] = COLUMN_MAPPING[category][field];
    });
  });
  
  return allColumns;
};

/**
 * Función para validar si una columna es soportada
 * @param {string} columnName - Nombre de la columna a validar
 * @returns {Object} Información sobre la columna si es soportada
 */
const isColumnSupported = (columnName) => {
  const normalizedName = columnName.toLowerCase().trim();
  
  for (const category of Object.keys(COLUMN_MAPPING)) {
    for (const field of Object.keys(COLUMN_MAPPING[category])) {
      const possibleNames = COLUMN_MAPPING[category][field];
      if (possibleNames.some(name => name.toLowerCase() === normalizedName)) {
        return {
          supported: true,
          category,
          field,
          originalName: columnName
        };
      }
    }
  }
  
  return { supported: false };
};

module.exports = {
  COLUMN_MAPPING,
  mapColumnValue,
  getColumnMapping,
  mapColumnValueByConfig,
  getAllSupportedColumns,
  isColumnSupported
};
