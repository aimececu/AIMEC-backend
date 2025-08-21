-- =====================================================
-- MIGRACIÓN: Crear tabla de productos relacionados
-- =====================================================

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS related_products (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    related_product_id INTEGER NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    CONSTRAINT fk_related_products_main_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_related_products_related_product 
        FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT unique_product_relation 
        UNIQUE(product_id, related_product_id),
    CONSTRAINT check_relationship_type_not_empty 
        CHECK (relationship_type != ''),
    CONSTRAINT check_sort_order_positive 
        CHECK (sort_order >= 0)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_related_products_product_id ON related_products(product_id);
CREATE INDEX IF NOT EXISTS idx_related_products_related_product_id ON related_products(related_product_id);
CREATE INDEX IF NOT EXISTS idx_related_products_relationship_type ON related_products(relationship_type);
CREATE INDEX IF NOT EXISTS idx_related_products_sort_order ON related_products(sort_order);

-- Insertar algunos tipos de relación predefinidos (opcional)
-- Esto se puede hacer también desde la aplicación

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar el trigger a la tabla related_products
DROP TRIGGER IF EXISTS update_related_products_updated_at ON related_products;
CREATE TRIGGER update_related_products_updated_at
    BEFORE UPDATE ON related_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en la tabla y columnas
COMMENT ON TABLE related_products IS 'Tabla para gestionar relaciones entre productos';
COMMENT ON COLUMN related_products.id IS 'ID único de la relación';
COMMENT ON COLUMN related_products.product_id IS 'ID del producto principal';
COMMENT ON COLUMN related_products.related_product_id IS 'ID del producto relacionado';
COMMENT ON COLUMN related_products.relationship_type IS 'Tipo de relación entre los productos';
COMMENT ON COLUMN related_products.sort_order IS 'Orden de clasificación para mostrar los productos relacionados';
COMMENT ON COLUMN related_products.created_at IS 'Fecha de creación de la relación';
COMMENT ON COLUMN related_products.updated_at IS 'Fecha de última actualización de la relación';

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'related_products' 
ORDER BY ordinal_position;
