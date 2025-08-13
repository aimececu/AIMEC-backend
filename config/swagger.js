const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AIMEC API",
      version: "1.0.0",
      description: "API para gestión de productos industriales AIMEC",
      contact: {
        name: "AIMEC Support",
        email: "support@aimec.com"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? "https://api.aimec.com" 
          : "http://localhost:3750",
        description: process.env.NODE_ENV === 'production' ? "Production server" : "Development server"
      }
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            sku: { type: "string", example: "SIEMENS-3RT1015-1BB41" },
            name: { type: "string", example: "Contacto auxiliar 3RT1015-1BB41" },
            description: { type: "string", example: "Contacto auxiliar normalmente abierto para contactores Siemens" },
            brand_id: { type: "integer", example: 1 },
            category_id: { type: "integer", example: 1 },
            subcategory_id: { type: "integer", example: 1 },
            price: { type: "number", example: 25.50 },
            stock_quantity: { type: "integer", example: 100 },
            min_stock_level: { type: "integer", example: 10 },
            weight: { type: "number", example: 0.5 },
            dimensions: { type: "string", example: "50x30x20" },
            main_image: { type: "string", example: "https://example.com/product-image.jpg" },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            updated_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
          }
        },
        ProductInput: {
          type: "object",
          required: ["sku", "name", "description", "price", "stock_quantity", "brand_id", "category_id"],
          properties: {
            sku: { 
              type: "string", 
              example: "SIEMENS-3RT1015-1BB41",
              description: "Código SKU único del producto"
            },
            name: { 
              type: "string", 
              example: "Contacto auxiliar 3RT1015-1BB41",
              description: "Nombre del producto"
            },
            description: { 
              type: "string", 
              example: "Contacto auxiliar normalmente abierto para contactores Siemens",
              description: "Descripción detallada del producto"
            },
            brand_id: { 
              type: "integer", 
              example: 1,
              description: "ID de la marca del producto"
            },
            category_id: { 
              type: "integer", 
              example: 1,
              description: "ID de la categoría del producto"
            },
            subcategory_id: { 
              type: "integer", 
              example: 1,
              description: "ID de la subcategoría del producto (opcional)"
            },
            price: { 
              type: "number", 
              example: 25.50,
              description: "Precio del producto en la moneda base"
            },
            stock_quantity: { 
              type: "integer", 
              example: 100,
              description: "Cantidad disponible en inventario"
            },
            min_stock_level: { 
              type: "integer", 
              example: 10,
              description: "Nivel mínimo de stock para alertas"
            },
            weight: { 
              type: "number", 
              example: 0.5,
              description: "Peso del producto en kg (opcional)"
            },
            dimensions: { 
              type: "string", 
              example: "50x30x20",
              description: "Dimensiones del producto (opcional)"
            },
            main_image: { 
              type: "string", 
              example: "https://example.com/product-image.jpg",
              description: "URL de la imagen principal del producto (opcional)"
            },
            is_active: { 
              type: "boolean", 
              example: true,
              description: "Estado activo del producto"
            }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Contactores" },
            description: { type: "string", example: "Dispositivos electromagnéticos para control de motores" },
            icon: { type: "string", example: "fas fa-plug" },
            color: { type: "string", example: "#3B82F6" },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            updated_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
          }
        },
        Subcategory: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Contactores de Potencia" },
            description: { type: "string", example: "Contactores para aplicaciones de alta potencia" },
            category_id: { type: "integer", example: 1 },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            updated_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
          }
        },
        Brand: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Siemens" },
            description: { type: "string", example: "Empresa alemana líder en tecnología industrial y automatización" },
            logo_url: { type: "string", example: "https://example.com/siemens-logo.png" },
            website: { type: "string", example: "https://www.siemens.com" },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            updated_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "admin@aimec.com" },
            name: { type: "string", example: "Administrador" },
            role: { type: "string", enum: ["admin", "user"], example: "admin" },
            is_active: { type: "boolean", example: true },
            last_login: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            created_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            updated_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
          }
        },
        Session: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            session_id: { type: "string", example: "sess_abc123def456" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            access_token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            ip_address: { type: "string", example: "192.168.1.100" },
            user_agent: { type: "string", example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..." },
            is_active: { type: "boolean", example: true },
            expires_at: { type: "string", format: "date-time", example: "2024-01-16T10:30:00Z" },
            created_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            updated_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
          }
        },
        Accessory: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            main_product_id: { type: "integer", example: 1, description: "ID del producto principal" },
            accessory_product_id: { type: "integer", example: 5, description: "ID del producto accesorio" },
            created_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
            updated_at: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" }
          }
        },
        AccessoryProduct: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            sku: { type: "string", example: "CAB-001" },
            name: { type: "string", example: "Cable de Alimentación" },
            description: { type: "string", example: "Cable de alimentación compatible" },
            short_description: { type: "string", example: "Cable industrial 3x2.5mm" },
            price: { type: "number", example: 25.50 },
            original_price: { type: "number", example: 30.00 },
            main_image: { type: "string", example: "https://example.com/cable.jpg" },
            additional_images: { type: "array", items: { type: "string" }, example: ["https://example.com/cable-detail.jpg"] },
            is_active: { type: "boolean", example: true },
            stock_quantity: { type: "integer", example: 50 },
            brand: {
              type: "object",
              properties: {
                id: { type: "integer", example: 2 },
                name: { type: "string", example: "CableTech" },
                logo_url: { type: "string", example: "https://example.com/cabletech-logo.png" }
              }
            },
            category: {
              type: "object",
              properties: {
                id: { type: "integer", example: 3 },
                name: { type: "string", example: "Cables" },
                color: { type: "string", example: "#FF6B6B" }
              }
            },
            subcategory: {
              type: "object",
              properties: {
                id: { type: "integer", example: 2 },
                name: { type: "string", example: "Cables de Alimentación" }
              }
            }
          }
        },
      
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        sessionAuth: {
          type: "apiKey",
          in: "header",
          name: "sessionid",
          description: "Session ID para autenticación"
        }
      }
    },
    tags: [
      {
        name: "Sistema",
        description: "Endpoints del sistema"
      },
      {
        name: "Autenticación",
        description: "Gestión de autenticación y usuarios"
      },
      {
        name: "Productos",
        description: "Gestión de productos"
      },
      {
        name: "Categorías",
        description: "Gestión de categorías"
      },
      {
        name: "Marcas",
        description: "Gestión de marcas"
      },
      {
        name: "Accesorios",
        description: "Gestión de relaciones entre productos principales y accesorios"
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const specs = swaggerJsdoc(swaggerOptions);

module.exports = specs; 