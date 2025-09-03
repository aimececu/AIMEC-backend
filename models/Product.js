const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  sku_ec: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'SKU alternativo o de exportación (opcional)'
  },
  potencia_kw: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Potencia del producto (ej: 0.37 kW, 1.5 HP, etc.)'
  },
  voltaje: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Voltaje del producto (ej: 1AC 200-400 V)'
  },
  frame_size: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tamaño del frame (ej: FSAA)'
  },
  corriente: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Corriente del producto (ej: 0.37 A, 1.5-2.2 A, etc.)'
  },
  comunicacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Tipo de comunicación del producto'
  },
  alimentacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Tipo de alimentación del producto'
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Cambiar a true para permitir productos sin marca
    references: {
      model: 'brands',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Cambiar a true para permitir productos sin categoría
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
  price: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Precio del producto (ej: 262.50, 1,250.00, etc.)'
  },
  stock_quantity: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Cantidad en stock (ej: 10, 0, Disponible, etc.)'
  },
  min_stock_level: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nivel mínimo de stock (ej: 5, 0, etc.)'
  },
  weight: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Peso del producto (ej: 0.5 kg, 1.2 lbs, etc.)'
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  main_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'products',
  schema: 'aimec_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Product;
