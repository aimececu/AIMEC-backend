const { sequelize } = require('../config/database');

// Importar modelos
const Brand = require('./Brand');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const ProductSeries = require('./ProductSeries');
const Product = require('./Product');
const SpecificationType = require('./SpecificationType');
const ProductSpecification = require('./ProductSpecification');
const Accessory = require('./Accessory');
const RelatedProduct = require('./RelatedProduct');
const Feature = require('./Feature');
const ProductFeature = require('./ProductFeature');
const Application = require('./Application');
const ProductApplication = require('./ProductApplication');
const Certification = require('./Certification');
const ProductCertification = require('./ProductCertification');

// =====================================================
// DEFINICIÓN DE ASOCIACIONES
// =====================================================

// Asociaciones de Product
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });
Product.belongsTo(ProductSeries, { foreignKey: 'series_id', as: 'series' });

// Asociaciones inversas
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Subcategory.hasMany(Product, { foreignKey: 'subcategory_id', as: 'products' });
ProductSeries.hasMany(Product, { foreignKey: 'series_id', as: 'products' });

// Asociaciones de Subcategory
Subcategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Subcategory, { foreignKey: 'category_id', as: 'subcategories' });

// Asociaciones de ProductSpecification
ProductSpecification.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductSpecification.belongsTo(SpecificationType, { foreignKey: 'specification_type_id', as: 'specificationType' });
Product.hasMany(ProductSpecification, { foreignKey: 'product_id', as: 'specifications' });
SpecificationType.hasMany(ProductSpecification, { foreignKey: 'specification_type_id', as: 'productSpecifications' });

// Asociaciones de Accessory
Accessory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Accessory.belongsTo(Product, { foreignKey: 'accessory_id', as: 'accessory' });
Product.hasMany(Accessory, { foreignKey: 'product_id', as: 'accessories' });

// Asociaciones de RelatedProduct
RelatedProduct.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
RelatedProduct.belongsTo(Product, { foreignKey: 'related_product_id', as: 'relatedProduct' });
Product.hasMany(RelatedProduct, { foreignKey: 'product_id', as: 'relatedProducts' });

// Asociaciones de ProductFeature
ProductFeature.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductFeature.belongsTo(Feature, { foreignKey: 'feature_id', as: 'feature' });
Product.hasMany(ProductFeature, { foreignKey: 'product_id', as: 'features' });
Feature.hasMany(ProductFeature, { foreignKey: 'feature_id', as: 'productFeatures' });

// Asociaciones de ProductApplication
ProductApplication.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductApplication.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
Product.hasMany(ProductApplication, { foreignKey: 'product_id', as: 'applications' });
Application.hasMany(ProductApplication, { foreignKey: 'application_id', as: 'productApplications' });

// Asociaciones de ProductCertification
ProductCertification.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductCertification.belongsTo(Certification, { foreignKey: 'certification_id', as: 'certification' });
Product.hasMany(ProductCertification, { foreignKey: 'product_id', as: 'certifications' });
Certification.hasMany(ProductCertification, { foreignKey: 'certification_id', as: 'productCertifications' });

module.exports = {
  sequelize,
  Brand,
  Category,
  Subcategory,
  ProductSeries,
  Product,
  SpecificationType,
  ProductSpecification,
  Accessory,
  RelatedProduct,
  Feature,
  ProductFeature,
  Application,
  ProductApplication,
  Certification,
  ProductCertification
}; 