const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductFeature = sequelize.define('ProductFeature', {
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
  feature_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'features',
      key: 'id'
    }
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
  tableName: 'product_features',
  schema: 'aimec_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['feature_id']
    },
    {
      unique: true,
      fields: ['product_id', 'feature_id']
    }
  ]
});

module.exports = ProductFeature; 