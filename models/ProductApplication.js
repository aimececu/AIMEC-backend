const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductApplication = sequelize.define('ProductApplication', {
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
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'applications',
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
  tableName: 'product_applications',
  schema: 'aimec_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['application_id']
    },
    {
      unique: true,
      fields: ['product_id', 'application_id']
    }
  ]
});

module.exports = ProductApplication; 