const { pool } = require('../../config/database');

// =====================================================
// CONSULTAS DE TIPOS DE ESPECIFICACIONES
// =====================================================

const getSpecificationTypes = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        st.*,
        c.name as category_name
      FROM specification_types st
      LEFT JOIN categories c ON st.category_id = c.id
      WHERE st.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.category_id) {
      query += ` AND st.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.data_type) {
      query += ` AND st.data_type = $${paramIndex}`;
      params.push(filters.data_type);
      paramIndex++;
    }

    query += ` ORDER BY st.sort_order, st.display_name`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener tipos de especificaciones: ${error.message}`);
  }
};

const getSpecificationTypeById = async (id) => {
  try {
    const result = await pool.query(`
      SELECT 
        st.*,
        c.name as category_name
      FROM specification_types st
      LEFT JOIN categories c ON st.category_id = c.id
      WHERE st.id = $1 AND st.is_active = true
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener tipo de especificación: ${error.message}`);
  }
};

const createSpecificationType = async (specTypeData) => {
  try {
    const { name, display_name, data_type, unit, is_required, sort_order, category_id } = specTypeData;
    const result = await pool.query(`
      INSERT INTO specification_types (name, display_name, data_type, unit, is_required, sort_order, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, display_name, data_type, unit, is_required, sort_order, category_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear tipo de especificación: ${error.message}`);
  }
};

const updateSpecificationType = async (id, specTypeData) => {
  try {
    const fields = Object.keys(specTypeData);
    const values = Object.values(specTypeData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE specification_types SET ${setClause} WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar tipo de especificación: ${error.message}`);
  }
};

const deleteSpecificationType = async (id) => {
  try {
    const result = await pool.query(
      'UPDATE specification_types SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar tipo de especificación: ${error.message}`);
  }
};

// =====================================================
// CONSULTAS DE ESPECIFICACIONES DE PRODUCTOS
// =====================================================

const getProductSpecifications = async (productId) => {
  try {
    const result = await pool.query(`
      SELECT 
        ps.*,
        st.name as spec_name,
        st.display_name as spec_display_name,
        st.data_type,
        st.unit,
        st.is_required
      FROM product_specifications ps
      JOIN specification_types st ON ps.specification_type_id = st.id
      WHERE ps.product_id = $1 AND st.is_active = true
      ORDER BY st.sort_order, st.display_name
    `, [productId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener especificaciones del producto: ${error.message}`);
  }
};

const getProductSpecificationById = async (id) => {
  try {
    const result = await pool.query(`
      SELECT 
        ps.*,
        st.name as spec_name,
        st.display_name as spec_display_name,
        st.data_type,
        st.unit,
        st.is_required,
        p.name as product_name
      FROM product_specifications ps
      JOIN specification_types st ON ps.specification_type_id = st.id
      JOIN products p ON ps.product_id = p.id
      WHERE ps.id = $1 AND st.is_active = true
    `, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al obtener especificación del producto: ${error.message}`);
  }
};

const createProductSpecification = async (specData) => {
  try {
    const { product_id, specification_type_id, value_text, value_number, value_boolean, value_json } = specData;
    const result = await pool.query(`
      INSERT INTO product_specifications (product_id, specification_type_id, value_text, value_number, value_boolean, value_json)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (product_id, specification_type_id) 
      DO UPDATE SET 
        value_text = EXCLUDED.value_text,
        value_number = EXCLUDED.value_number,
        value_boolean = EXCLUDED.value_boolean,
        value_json = EXCLUDED.value_json,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [product_id, specification_type_id, value_text, value_number, value_boolean, value_json]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear especificación del producto: ${error.message}`);
  }
};

const updateProductSpecification = async (id, specData) => {
  try {
    const fields = Object.keys(specData);
    const values = Object.values(specData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE product_specifications SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar especificación del producto: ${error.message}`);
  }
};

const deleteProductSpecification = async (id) => {
  try {
    const result = await pool.query(
      'DELETE FROM product_specifications WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar especificación del producto: ${error.message}`);
  }
};

// =====================================================
// CONSULTAS MASIVAS DE ESPECIFICACIONES
// =====================================================

const createMultipleProductSpecifications = async (productId, specifications) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const results = [];
    
    for (const spec of specifications) {
      const { specification_type_id, value_text, value_number, value_boolean, value_json } = spec;
      
      const result = await client.query(`
        INSERT INTO product_specifications (product_id, specification_type_id, value_text, value_number, value_boolean, value_json)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (product_id, specification_type_id) 
        DO UPDATE SET 
          value_text = EXCLUDED.value_text,
          value_number = EXCLUDED.value_number,
          value_boolean = EXCLUDED.value_boolean,
          value_json = EXCLUDED.value_json,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [productId, specification_type_id, value_text, value_number, value_boolean, value_json]);
      
      results.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error al crear especificaciones múltiples: ${error.message}`);
  } finally {
    client.release();
  }
};

const getSpecificationsByCategory = async (categoryId) => {
  try {
    const result = await pool.query(`
      SELECT 
        st.*,
        COUNT(ps.id) as usage_count
      FROM specification_types st
      LEFT JOIN product_specifications ps ON st.id = ps.specification_type_id
      WHERE st.category_id = $1 AND st.is_active = true
      GROUP BY st.id
      ORDER BY st.sort_order, st.display_name
    `, [categoryId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener especificaciones por categoría: ${error.message}`);
  }
};

const getProductSpecificationsComplete = async (productId) => {
  try {
    const result = await pool.query(`
      SELECT 
        ps.*,
        st.name as spec_name,
        st.display_name as spec_display_name,
        st.data_type,
        st.unit,
        st.is_required,
        st.sort_order,
        CASE 
          WHEN st.data_type = 'text' THEN ps.value_text
          WHEN st.data_type = 'number' THEN ps.value_number::text
          WHEN st.data_type = 'boolean' THEN ps.value_boolean::text
          WHEN st.data_type = 'select' THEN ps.value_json::text
          ELSE NULL
        END as display_value
      FROM specification_types st
      LEFT JOIN product_specifications ps ON st.id = ps.specification_type_id AND ps.product_id = $1
      WHERE st.is_active = true
      ORDER BY st.sort_order, st.display_name
    `, [productId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener especificaciones completas del producto: ${error.message}`);
  }
};

// =====================================================
// CONSULTAS DE FILTRADO POR ESPECIFICACIONES
// =====================================================

const getProductsBySpecification = async (specificationTypeId, value, dataType) => {
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
      JOIN product_specifications pspec ON p.id = pspec.product_id
      WHERE p.is_active = true AND pspec.specification_type_id = $1
    `;
    
    const params = [specificationTypeId];
    let paramIndex = 2;

    // Aplicar filtro según el tipo de dato
    switch (dataType) {
      case 'text':
        query += ` AND pspec.value_text ILIKE $${paramIndex}`;
        params.push(`%${value}%`);
        break;
      case 'number':
        query += ` AND pspec.value_number = $${paramIndex}`;
        params.push(parseFloat(value));
        break;
      case 'boolean':
        query += ` AND pspec.value_boolean = $${paramIndex}`;
        params.push(value === 'true');
        break;
      case 'select':
        query += ` AND pspec.value_json::text ILIKE $${paramIndex}`;
        params.push(`%${value}%`);
        break;
    }

    query += ` ORDER BY p.name`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al filtrar productos por especificación: ${error.message}`);
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
  
  // Consultas Masivas
  createMultipleProductSpecifications,
  getSpecificationsByCategory,
  getProductSpecificationsComplete,
  
  // Filtrado
  getProductsBySpecification
}; 