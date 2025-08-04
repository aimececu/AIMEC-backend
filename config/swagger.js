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
            id: { type: "integer" },
            sku: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock_quantity: { type: "integer" },
            is_active: { type: "boolean" },
            created_at: { type: "string", format: "date-time" }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            slug: { type: "string" },
            description: { type: "string" },
            is_active: { type: "boolean" }
          }
        },
        Brand: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            logo: { type: "string" },
            is_active: { type: "boolean" }
          }
        },
        Specification: {
          type: "object",
          properties: {
            id: { type: "integer" },
            product_id: { type: "integer" },
            specification_type_id: { type: "integer" },
            value: { type: "string" },
            unit: { type: "string" }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    tags: [
      {
        name: "Sistema",
        description: "Endpoints del sistema"
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
        name: "Series",
        description: "Gestión de series de productos"
      },
      {
        name: "Especificaciones",
        description: "Gestión de especificaciones de productos"
      }
    ]
  },
  apis: ["./routes/*.js", "./controllers/*.js"]
};

const specs = swaggerJsdoc(swaggerOptions);

module.exports = specs; 