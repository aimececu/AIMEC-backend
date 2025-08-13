const { sequelize } = require('../config/database');

// Importar modelos básicos
const User = require('./User');
const Brand = require('./Brand');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Product = require('./Product');
const ProductFeature = require('./ProductFeature');
const ProductApplication = require('./ProductApplication');
const Accessory = require('./Accessory');
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

// NUEVAS ASOCIACIONES PARA FEATURES Y APPLICATIONS
Product.hasMany(ProductFeature, { foreignKey: 'product_id', as: 'features' });
ProductFeature.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductApplication, { foreignKey: 'product_id', as: 'applications' });
ProductApplication.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Asociaciones de Accessory
Product.hasMany(Accessory, { foreignKey: 'main_product_id', as: 'mainProductAccessories' });
Product.hasMany(Accessory, { foreignKey: 'accessory_product_id', as: 'accessoryForProducts' });
Accessory.belongsTo(Product, { foreignKey: 'main_product_id', as: 'mainProduct' });
Accessory.belongsTo(Product, { foreignKey: 'accessory_product_id', as: 'accessoryProduct' });

// Asociaciones de Session
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });

module.exports = {
  sequelize,
  User,
  Brand,
  Category,
  Subcategory,
  Product,
  ProductFeature,
  ProductApplication,
  Accessory,
  Session
}; 