const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 5,
    validate: {
      min: 0
    }
  },
  warranty_months: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  lead_time_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  voltage: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Voltaje en V'
  },
  power: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Potencia en W'
  },
  temperature_range: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Rango de temperatura de operación'
  },
  ip_rating: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Clasificación IP'
  },
  material: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Material del producto'
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Color del producto'
  },
  country_of_origin: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'País de origen'
  },
  compliance: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Certificaciones y cumplimiento'
  },
  manual_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del manual de usuario'
  },
  datasheet_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la hoja de datos'
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'brands',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'subcategories',
      key: 'id'
    }
  },
  series_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'product_series',
      key: 'id'
    }
  },
  // slug: {
  //   type: DataTypes.STRING(255),
  //   allowNull: false,
  //   unique: true,
  //   validate: {
  //     notEmpty: true
  //   }
  // },
  additional_images: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  main_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // is_digital: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: false,
  //   defaultValue: false
  // },
  // requires_shipping: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: false,
  //   defaultValue: true
  // },
  // tax_rate: {
  //   type: DataTypes.DECIMAL(5, 2),
  //   allowNull: true,
  //   defaultValue: 0,
  //   validate: {
  //     min: 0,
  //     max: 100
  //   }
  // },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  meta_keywords: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    },
    comment: 'Calificación promedio del producto (0-5)'
  },
  review_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número total de reseñas'
  },
  // tags: {
  //   type: DataTypes.JSONB,
  //   allowNull: true,
  //   defaultValue: []
  // },
  // warranty_info: {
  //   type: DataTypes.TEXT,
  //   allowNull: true
  // },
  // installation_guide: {
  //   type: DataTypes.TEXT,
  //   allowNull: true
  // },
  // technical_specs: {
  //   type: DataTypes.JSONB,
  //   allowNull: true
  // },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'products',
  schema: 'aimec_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['sku']
    },
    // {
    //   fields: ['slug']
    // },
    {
      fields: ['brand_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['subcategory_id']
    },
    {
      fields: ['series_id']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['price']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Product; 