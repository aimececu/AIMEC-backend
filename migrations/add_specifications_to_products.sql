-- =====================================================
-- MIGRACIÓN: Agregar campo specifications a products
-- =====================================================

-- Agregar columna specifications como JSONB
ALTER TABLE aimec_products.products 
ADD COLUMN specifications JSONB DEFAULT '[]'::jsonb;

-- Comentario para la columna
COMMENT ON COLUMN aimec_products.products.specifications IS 'Especificaciones del producto como array de objetos {name, value}';

-- Índice para búsquedas en especificaciones (opcional)
CREATE INDEX idx_products_specifications ON aimec_products.products USING GIN (specifications);
