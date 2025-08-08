const { pool } = require('../../config/database');

// =====================================================
// CONSULTAS BÁSICAS DE PRODUCTOS
// =====================================================

const getAllProducts = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        ps.name as series_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_series ps ON p.series_id = ps.id
      WHERE p.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;

    // Aplicar filtros
    if (filters.category_id) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.brand_id) {
      query += ` AND p.brand_id = $${paramIndex}`;
      params.push(filters.brand_id);
      paramIndex++;
    }

    if (filters.subcategory_id) {
      query += ` AND p.subcategory_id = $${paramIndex}`;
      params.push(filters.subcategory_id);
      paramIndex++;
    }

    if (filters.min_price) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(filters.min_price);
      paramIndex++;
    }

    if (filters.max_price) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(filters.max_price);
      paramIndex++;
    }

    if (filters.featured) {
      query += ` AND p.is_featured = true`;
    }

    if (filters.in_stock) {
      query += ` AND p.stock_quantity > 0`;
    }

    // Ordenamiento
    query += ` ORDER BY p.created_at DESC`;

    // Paginación
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows || [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

const getProductById = async (id) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        ps.name as series_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_series ps ON p.series_id = ps.id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener producto: ${error.message}`);
  }
};

const getProductBySlug = async (slug) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        ps.name as series_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_series ps ON p.series_id = ps.id
      WHERE p.slug = $1 AND p.is_active = true
    `, [slug]);
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener producto por slug: ${error.message}`);
  }
};

const createProduct = async (productData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      sku, name, description, short_description, brand_id, category_id, subcategory_id, series_id,
      price, original_price, cost_price, stock_quantity, min_stock_level, weight, dimensions,
      warranty_months, lead_time_days, main_image, additional_images, is_featured,
      meta_title, meta_description, slug
    } = productData;

    const result = await client.query(`
      INSERT INTO products (
        sku, name, description, short_description, brand_id, category_id, subcategory_id, series_id,
        price, original_price, cost_price, stock_quantity, min_stock_level, weight, dimensions,
        warranty_months, lead_time_days, main_image, additional_images, is_featured,
        meta_title, meta_description, slug
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `, [
      sku, name, description, short_description, brand_id, category_id, subcategory_id, series_id,
      price, original_price, cost_price, stock_quantity, min_stock_level, weight, dimensions,
      warranty_months, lead_time_days, main_image, additional_images, is_featured,
      meta_title, meta_description, slug
    ]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error al crear producto: ${error.message}`);
  } finally {
    client.release();
  }
};

const updateProduct = async (id, productData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fields = Object.keys(productData);
    const values = Object.values(productData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    
    const result = await client.query(query, [id, ...values]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error al actualizar producto: ${error.message}`);
  } finally {
    client.release();
  }
};

const deleteProduct = async (id) => {
  try {
    const result = await pool.query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
};

// =====================================================
// BÚSQUEDA Y FILTRADO
// =====================================================

const searchProducts = async (searchTerm, filters = {}) => {
  try {
    let query = `
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        ps.name as series_name,
        ts_rank(to_tsvector('spanish', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('spanish', $1)) as rank
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_series ps ON p.series_id = ps.id
      WHERE p.is_active = true
        AND (to_tsvector('spanish', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('spanish', $1)
             OR p.sku ILIKE $2
             OR p.name ILIKE $2)
    `;
    
    const params = [searchTerm, `%${searchTerm}%`];
    let paramIndex = 3;

    // Aplicar filtros adicionales
    if (filters.category_id) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.brand_id) {
      query += ` AND p.brand_id = $${paramIndex}`;
      params.push(filters.brand_id);
      paramIndex++;
    }

    query += ` ORDER BY rank DESC, p.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error(`Error en búsqueda de productos: ${error.message}`);
  }
};

const getFeaturedProducts = async (limit = 10) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        ps.name as series_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_series ps ON p.series_id = ps.id
      WHERE p.is_active = true AND p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener productos destacados: ${error.message}`);
  }
};

const getProductsByCategory = async (categoryId, limit = 20) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        ps.name as series_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_series ps ON p.series_id = ps.id
      WHERE p.is_active = true AND p.category_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2
    `, [categoryId, limit]);
    
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener productos por categoría: ${error.message}`);
  }
};

// =====================================================
// ESTADÍSTICAS Y REPORTES
// =====================================================

const getProductStats = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as in_stock,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock_quantity <= min_stock_level AND stock_quantity > 0 THEN 1 END) as low_stock,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_products,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM products
      WHERE is_active = true
    `);
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener estadísticas de productos: ${error.message}`);
  }
};

const getProductsByBrand = async (brandId) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name,
        sc.name as subcategory_name,
        ps.name as series_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_series ps ON p.series_id = ps.id
      WHERE p.is_active = true AND p.brand_id = $1
      ORDER BY p.created_at DESC
    `, [brandId]);
    
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener productos por marca: ${error.message}`);
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
  getProductStats,
  getProductsByBrand
}; 