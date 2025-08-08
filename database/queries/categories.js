const { pool } = require('../../config/database');

// =====================================================
// CONSULTAS DE CATEGORÍAS
// =====================================================

const getAllCategories = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(sc.id) as subcategories_count,
        COUNT(p.id) as products_count
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id AND sc.is_active = true
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `);
    return result.rows || [];
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};

const getCategoryById = async (id) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(sc.id) as subcategories_count,
        COUNT(p.id) as products_count
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id AND sc.is_active = true
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.id = $1 AND c.is_active = true
      GROUP BY c.id
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener categoría: ${error.message}`);
  }
};

const createCategory = async (categoryData) => {
  try {
    const { name, description, icon, color, sort_order } = categoryData;
    const result = await pool.query(`
      INSERT INTO categories (name, description, icon, color, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, icon, color, sort_order]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear categoría: ${error.message}`);
  }
};

const updateCategory = async (id, categoryData) => {
  try {
    const fields = Object.keys(categoryData);
    const values = Object.values(categoryData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar categoría: ${error.message}`);
  }
};

const deleteCategory = async (id) => {
  try {
    const result = await pool.query(
      'UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar categoría: ${error.message}`);
  }
};

// =====================================================
// CONSULTAS DE SUBCATEGORÍAS
// =====================================================

const getSubcategoriesByCategory = async (categoryId) => {
  try {
    const result = await pool.query(`
      SELECT 
        sc.*,
        COUNT(p.id) as products_count
      FROM subcategories sc
      LEFT JOIN products p ON sc.id = p.subcategory_id AND p.is_active = true
      WHERE sc.category_id = $1 AND sc.is_active = true
      GROUP BY sc.id
      ORDER BY sc.sort_order, sc.name
    `, [categoryId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener subcategorías: ${error.message}`);
  }
};

const getSubcategoryById = async (id) => {
  try {
    const result = await pool.query(`
      SELECT 
        sc.*,
        c.name as category_name,
        COUNT(p.id) as products_count
      FROM subcategories sc
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN products p ON sc.id = p.subcategory_id AND p.is_active = true
      WHERE sc.id = $1 AND sc.is_active = true
      GROUP BY sc.id, c.name
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener subcategoría: ${error.message}`);
  }
};

const createSubcategory = async (subcategoryData) => {
  try {
    const { category_id, name, description, sort_order } = subcategoryData;
    const result = await pool.query(`
      INSERT INTO subcategories (category_id, name, description, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [category_id, name, description, sort_order]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear subcategoría: ${error.message}`);
  }
};

const updateSubcategory = async (id, subcategoryData) => {
  try {
    const fields = Object.keys(subcategoryData);
    const values = Object.values(subcategoryData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE subcategories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar subcategoría: ${error.message}`);
  }
};

const deleteSubcategory = async (id) => {
  try {
    const result = await pool.query(
      'UPDATE subcategories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar subcategoría: ${error.message}`);
  }
};

// =====================================================
// CONSULTAS DE MARCAS
// =====================================================

const getAllBrands = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        COUNT(p.id) as products_count
      FROM brands b
      LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = true
      WHERE b.is_active = true
      GROUP BY b.id
      ORDER BY b.name
    `);
    return result.rows || [];
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return [];
  }
};

const getBrandById = async (id) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        COUNT(p.id) as products_count
      FROM brands b
      LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = true
      WHERE b.id = $1 AND b.is_active = true
      GROUP BY b.id
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener marca: ${error.message}`);
  }
};

const createBrand = async (brandData) => {
  try {
    const { name, description, logo_url, website } = brandData;
    const result = await pool.query(`
      INSERT INTO brands (name, description, logo_url, website)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, logo_url, website]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear marca: ${error.message}`);
  }
};

const updateBrand = async (id, brandData) => {
  try {
    const fields = Object.keys(brandData);
    const values = Object.values(brandData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE brands SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar marca: ${error.message}`);
  }
};

const deleteBrand = async (id) => {
  try {
    const result = await pool.query(
      'UPDATE brands SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar marca: ${error.message}`);
  }
};

// =====================================================
// CONSULTAS DE SERIES DE PRODUCTOS
// =====================================================

const getProductSeries = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        ps.*,
        b.name as brand_name,
        c.name as category_name,
        COUNT(p.id) as products_count
      FROM product_series ps
      LEFT JOIN brands b ON ps.brand_id = b.id
      LEFT JOIN categories c ON ps.category_id = c.id
      LEFT JOIN products p ON ps.id = p.series_id AND p.is_active = true
      WHERE ps.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.brand_id) {
      query += ` AND ps.brand_id = $${paramIndex}`;
      params.push(filters.brand_id);
      paramIndex++;
    }

    if (filters.category_id) {
      query += ` AND ps.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    query += ` GROUP BY ps.id, b.name, c.name ORDER BY ps.name`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener series de productos: ${error.message}`);
  }
};

const getProductSeriesById = async (id) => {
  try {
    const result = await pool.query(`
      SELECT 
        ps.*,
        b.name as brand_name,
        c.name as category_name,
        COUNT(p.id) as products_count
      FROM product_series ps
      LEFT JOIN brands b ON ps.brand_id = b.id
      LEFT JOIN categories c ON ps.category_id = c.id
      LEFT JOIN products p ON ps.id = p.series_id AND p.is_active = true
      WHERE ps.id = $1 AND ps.is_active = true
      GROUP BY ps.id, b.name, c.name
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener serie de productos: ${error.message}`);
  }
};

const createProductSeries = async (seriesData) => {
  try {
    const { brand_id, category_id, name, description } = seriesData;
    const result = await pool.query(`
      INSERT INTO product_series (brand_id, category_id, name, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [brand_id, category_id, name, description]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear serie de productos: ${error.message}`);
  }
};

const updateProductSeries = async (id, seriesData) => {
  try {
    const fields = Object.keys(seriesData);
    const values = Object.values(seriesData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE product_series SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar serie de productos: ${error.message}`);
  }
};

const deleteProductSeries = async (id) => {
  try {
    const result = await pool.query(
      'UPDATE product_series SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar serie de productos: ${error.message}`);
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