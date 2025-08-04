const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductSpecification = sequelize.define('ProductSpecification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  specification_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'specification_types',
      key: 'id'
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
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
  tableName: 'product_specifications',
  schema: 'aimec_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['specification_type_id']
    },
    {
      unique: true,
      fields: ['product_id', 'specification_type_id']
    }
  ]
});

module.exports = ProductSpecification; 