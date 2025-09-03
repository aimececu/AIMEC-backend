-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA SISTEMA DE PRODUCTOS: aimec_products
-- =====================================================

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de Marcas
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(255),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías Principales
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Subcategorías
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Series de Productos
CREATE TABLE product_series (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA PRINCIPAL DE PRODUCTOS
-- =====================================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Relaciones
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    series_id INTEGER REFERENCES product_series(id) ON DELETE SET NULL,
    
    -- Precios y Stock
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    
    -- Información adicional
    weight DECIMAL(8,3), -- en kg
    dimensions VARCHAR(100), -- "LxWxH cm"
    warranty_months INTEGER,
    lead_time_days INTEGER,
    
    -- Imágenes
    main_image VARCHAR(255),
    additional_images JSONB, -- Array de URLs
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    slug VARCHAR(255) UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SISTEMA DINÁMICO DE ESPECIFICACIONES
-- =====================================================

-- Tabla de Tipos de Especificaciones
CREATE TABLE specification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    data_type VARCHAR(20) NOT NULL, -- 'text', 'number', 'boolean', 'select', 'range'
    unit VARCHAR(20), -- 'mm', 'kg', 'V', 'A', etc.
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Valores de Especificaciones para Productos
CREATE TABLE product_specifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    specification_type_id INTEGER REFERENCES specification_types(id) ON DELETE CASCADE,
    value_text TEXT,
    value_number DECIMAL(15,5),
    value_boolean BOOLEAN,
    value_json JSONB, -- Para valores complejos o rangos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, specification_type_id)
);

-- =====================================================
-- SISTEMA DE ACCESORIOS Y PRODUCTOS RELACIONADOS
-- =====================================================

-- Tabla de Accesorios
CREATE TABLE accessories (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50),
    price DECIMAL(10,2),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos Relacionados
CREATE TABLE related_products (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    related_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- 'complementary', 'alternative', 'upgrade', 'downgrade'
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, related_product_id)
);

-- =====================================================
-- SISTEMA DE CARACTERÍSTICAS Y APLICACIONES
-- =====================================================

-- Tabla de Características
CREATE TABLE features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Producto-Características
CREATE TABLE product_features (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, feature_id)
);

-- Tabla de Aplicaciones
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Producto-Aplicaciones
CREATE TABLE product_applications (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, application_id)
);

-- =====================================================
-- SISTEMA DE CERTIFICACIONES
-- =====================================================

CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_certifications (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, certification_id)
);

-- =====================================================
-- SISTEMA DE IMPORTACIÓN CSV/EXCEL
-- =====================================================

-- Tabla de Plantillas de Importación
CREATE TABLE import_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    template_config JSONB NOT NULL, -- Configuración de columnas
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Historial de Importaciones
CREATE TABLE import_history (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES import_templates(id),
    filename VARCHAR(255) NOT NULL,
    total_rows INTEGER,
    successful_rows INTEGER,
    failed_rows INTEGER,
    error_log JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_by INTEGER, -- User ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices principales
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_series ON products(series_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);

-- Índices para especificaciones
CREATE INDEX idx_product_specs_product ON product_specifications(product_id);
CREATE INDEX idx_product_specs_type ON product_specifications(specification_type_id);

-- Índices para búsqueda
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_products_description_search ON products USING gin(to_tsvector('spanish', description));

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar marcas principales
INSERT INTO brands (name, description) VALUES
('Siemens', 'Líder en automatización industrial'),
('Allen-Bradley', 'Soluciones de control industrial'),
('Schneider Electric', 'Automatización y control'),
('Omron', 'Automatización industrial'),
('Mitsubishi', 'Sistemas de control');

-- Insertar categorías principales
INSERT INTO categories (name, description, sort_order) VALUES
('Controladores', 'PLCs, PACs y sistemas de control', 1),
('Interfaces HMI', 'Paneles de operador y HMI', 2),
('Variadores', 'Variadores de frecuencia y servo', 3),
('Sensores', 'Sensores de todo tipo', 4),
('Actuadores', 'Actuadores lineales y rotativos', 5);

-- Insertar subcategorías
INSERT INTO subcategories (category_id, name, sort_order) VALUES
(1, 'PLC', 1),
(1, 'PAC', 2),
(1, 'RTU', 3),
(2, 'Paneles Táctiles', 1),
(2, 'Paneles de Operador', 2),
(2, 'HMI Móvil', 3),
(3, 'Variadores de Frecuencia', 1),
(3, 'Servo Variadores', 2),
(3, 'Variadores DC', 3),
(4, 'Sensores de Proximidad', 1),
(4, 'Sensores de Temperatura', 2),
(4, 'Sensores de Presión', 3),
(4, 'Sensores de Flujo', 4),
(5, 'Actuadores Lineales', 1),
(5, 'Actuadores Rotativos', 2),
(5, 'Actuadores Neumáticos', 3);

-- Insertar tipos de especificaciones comunes
INSERT INTO specification_types (name, display_name, data_type, unit, is_required, category_id, sort_order) VALUES
-- Controladores
('cpu', 'CPU', 'text', NULL, true, 1, 1),
('memory', 'Memoria', 'text', NULL, true, 1, 2),
('digital_inputs', 'Entradas Digitales', 'number', NULL, false, 1, 3),
('digital_outputs', 'Salidas Digitales', 'number', NULL, false, 1, 4),
('analog_inputs', 'Entradas Analógicas', 'number', NULL, false, 1, 5),
('analog_outputs', 'Salidas Analógicas', 'number', NULL, false, 1, 6),
('communication', 'Comunicación', 'text', NULL, false, 1, 7),
('power_supply', 'Alimentación', 'text', NULL, true, 1, 8),
('operating_temperature', 'Temperatura de Operación', 'text', NULL, false, 1, 9),
('protection', 'Protección', 'text', NULL, false, 1, 10),

-- HMI
('display', 'Pantalla', 'text', NULL, true, 2, 1),
('resolution', 'Resolución', 'text', NULL, true, 2, 2),
('touch', 'Tipo de Touch', 'text', NULL, false, 2, 3),
('memory', 'Memoria', 'text', NULL, false, 2, 4),

-- Variadores
('power', 'Potencia', 'text', 'kW', true, 3, 1),
('input_voltage', 'Voltaje de Entrada', 'text', 'V', true, 3, 2),
('output_voltage', 'Voltaje de Salida', 'text', 'V', false, 3, 3),
('frequency', 'Frecuencia', 'text', 'Hz', false, 3, 4),

-- Sensores
('range', 'Rango', 'text', NULL, false, 4, 1),
('accuracy', 'Precisión', 'text', NULL, false, 4, 2),
('response_time', 'Tiempo de Respuesta', 'text', 'ms', false, 4, 3),
('output', 'Tipo de Salida', 'text', NULL, false, 4, 4),

-- Actuadores
('stroke', 'Carrera', 'text', 'mm', false, 5, 1),
('force', 'Fuerza', 'text', 'N', false, 5, 2),
('speed', 'Velocidad', 'text', 'mm/s', false, 5, 3),
('accuracy', 'Precisión', 'text', 'mm', false, 5, 4);

-- Insertar certificaciones comunes
INSERT INTO certifications (name, description) VALUES
('CE', 'Conformidad Europea'),
('UL', 'Underwriters Laboratories'),
('CSA', 'Canadian Standards Association'),
('SIL2', 'Safety Integrity Level 2'),
('ATEX', 'Atmósferas Explosivas'),
('IEC', 'International Electrotechnical Commission');

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_series_updated_at BEFORE UPDATE ON product_series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar slug automáticamente
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug = trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_product_slug BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION generate_slug();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para productos con información completa
CREATE VIEW products_complete AS
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
WHERE p.is_active = true;

-- Vista para especificaciones de productos
CREATE VIEW product_specifications_view AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    st.name as spec_name,
    st.display_name as spec_display_name,
    st.data_type,
    st.unit,
    ps.value_text,
    ps.value_number,
    ps.value_boolean,
    ps.value_json
FROM products p
JOIN product_specifications ps ON p.id = ps.product_id
JOIN specification_types st ON ps.specification_type_id = st.id
WHERE p.is_active = true; 