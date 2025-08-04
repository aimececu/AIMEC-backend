
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductCertification = sequelize.define('ProductCertification', {
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
  certification_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'certifications',
      key: 'id'
    }
  },
  certification_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'product_certifications',
  schema: 'aimec_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['certification_id']
    },
    {
      unique: true,
      fields: ['product_id', 'certification_id']
    }
  ]
});

module.exports = ProductCertification; 