-- =====================================================
-- MIGRACIÓN: Añadir nuevos campos a la tabla products
-- =====================================================

-- Añadir campo sku_ec (código alternativo)
ALTER TABLE aimec_products.products 
ADD COLUMN sku_ec VARCHAR(100) UNIQUE NOT NULL DEFAULT '';

-- Añadir campo potencia_kw (potencia en kilowatts)
ALTER TABLE aimec_products.products 
ADD COLUMN potencia_kw DECIMAL(8,2);

-- Añadir campo voltaje (voltaje del producto)
ALTER TABLE aimec_products.products 
ADD COLUMN voltaje VARCHAR(100);

-- Añadir campo frame_size (tamaño del frame)
ALTER TABLE aimec_products.products 
ADD COLUMN frame_size VARCHAR(50);

-- Añadir comentarios a los nuevos campos
COMMENT ON COLUMN aimec_products.products.sku_ec IS 'Código alternativo del producto (ej: código del fabricante)';
COMMENT ON COLUMN aimec_products.products.potencia_kw IS 'Potencia en kilowatts (ej: 0.37)';
COMMENT ON COLUMN aimec_products.products.voltaje IS 'Voltaje del producto (ej: 1AC 200-400 V)';
COMMENT ON COLUMN aimec_products.products.frame_size IS 'Tamaño del frame (ej: FSAA)';

-- Crear índices para mejorar el rendimiento de búsquedas
CREATE INDEX idx_products_sku_ec ON aimec_products.products(sku_ec);
CREATE INDEX idx_products_potencia_kw ON aimec_products.products(potencia_kw);
CREATE INDEX idx_products_voltaje ON aimec_products.products(voltaje);
CREATE INDEX idx_products_frame_size ON aimec_products.products(frame_size);
