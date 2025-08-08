const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Specification = sequelize.define('Specification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  data_type: {
    type: DataTypes.ENUM('text', 'number', 'boolean'),
    allowNull: false,
    defaultValue: 'text'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'specifications',
  schema: 'aimec_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Specification;
