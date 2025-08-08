const { sequelize } = require('../config/database');

// Importar modelos básicos
const User = require('./User');
const Brand = require('./Brand');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Specification = require('./Specification');
const Product = require('./Product');
const Session = require('./Session');

// =====================================================
// DEFINICIÓN DE ASOCIACIONES
// =====================================================

// Asociaciones de Subcategory
Subcategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Subcategory, { foreignKey: 'category_id', as: 'subcategories' });

// Asociaciones de Product
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });

// Asociaciones inversas
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Subcategory.hasMany(Product, { foreignKey: 'subcategory_id', as: 'products' });

// Asociaciones de Session
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });

module.exports = {
  sequelize,
  User,
  Brand,
  Category,
  Subcategory,
  Specification,
  Product,
  Session
}; 