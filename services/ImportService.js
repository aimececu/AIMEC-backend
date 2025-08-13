const { Product, Brand, Category, Subcategory, ProductFeature, ProductApplication } = require('../models');
const { Op } = require('sequelize');

class ImportService {
  // Importar datos del sistema desde un archivo
  async importSystemData(data) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const results = {
        brands_created: 0,
        brands_existing: 0,
        categories_created: 0,
        categories_existing: 0,
        subcategories_created: 0,
        subcategories_existing: 0,
        products_created: 0,
        products_updated: 0,
        features_created: 0,
        applications_created: 0,
        errors: []
      };

      // Procesar cada fila del archivo
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 porque Excel empieza en 1 y la primera fila son headers
        
        try {
          // Procesar marca
          const brand = await this.processBrand(row.marca, transaction);
          if (brand.isNew) results.brands_created++;
          else results.brands_existing++;

          // Procesar categoría
          const category = await this.processCategory(row.categoria, transaction);
          if (category.isNew) results.categories_created++;
          else results.categories_existing++;

          // Procesar subcategoría
          const subcategory = await this.processSubcategory(row.subcategoria, category.id, transaction);
          if (subcategory.isNew) results.subcategories_created++;
          else results.subcategories_existing++;

          // Procesar producto
          const productResult = await this.processProduct(row, brand.id, category.id, subcategory.id, transaction);
          if (productResult.isNew) results.products_created++;
          else results.products_updated++;

          // Procesar características si existen
          if (row.caracteristicas) {
            const featuresCount = await this.processProductFeatures(row.caracteristicas, productResult.id, transaction);
            results.features_created += featuresCount;
          }

          // Procesar aplicaciones si existen
          if (row.aplicaciones) {
            const applicationsCount = await this.processProductApplications(row.aplicaciones, productResult.id, transaction);
            results.applications_created += applicationsCount;
          }

        } catch (error) {
          results.errors.push({
            row: rowNumber,
            error: error.message,
            data: row
          });
        }
      }

      await transaction.commit();
      return results;

    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error en la importación: ${error.message}`);
    }
  }

  // Procesar marca (crear si no existe)
  async processBrand(brandName, transaction) {
    if (!brandName) {
      throw new Error('Nombre de marca es requerido');
    }

    let brand = await Brand.findOne({
      where: { 
        name: { [Op.iLike]: brandName },
        is_active: true
      },
      transaction
    });

    if (!brand) {
      brand = await Brand.create({
        name: brandName,
        description: `Marca importada: ${brandName}`,
        is_active: true
      }, { transaction });
      
      return { ...brand.toJSON(), isNew: true };
    }

    return { ...brand.toJSON(), isNew: false };
  }

  // Procesar categoría (crear si no existe)
  async processCategory(categoryName, transaction) {
    if (!categoryName) {
      throw new Error('Nombre de categoría es requerido');
    }

    let category = await Category.findOne({
      where: { 
        name: { [Op.iLike]: categoryName },
        is_active: true
      },
      transaction
    });

    if (!category) {
      category = await Category.create({
        name: categoryName,
        description: `Categoría importada: ${categoryName}`,
        icon: 'fas fa-folder',
        color: '#3B82F6',
        is_active: true
      }, { transaction });
      
      return { ...category.toJSON(), isNew: true };
    }

    return { ...category.toJSON(), isNew: false };
  }

  // Procesar subcategoría (crear si no existe)
  async processSubcategory(subcategoryName, categoryId, transaction) {
    if (!subcategoryName) {
      // Si no hay subcategoría, crear una por defecto
      subcategoryName = 'General';
    }

    let subcategory = await Subcategory.findOne({
      where: { 
        name: { [Op.iLike]: subcategoryName },
        category_id: categoryId,
        is_active: true
      },
      transaction
    });

    if (!subcategory) {
      subcategory = await Subcategory.create({
        name: subcategoryName,
        description: `Subcategoría importada: ${subcategoryName}`,
        category_id: categoryId,
        is_active: true
      }, { transaction });
      
      return { ...subcategory.toJSON(), isNew: true };
    }

    return { ...subcategory.toJSON(), isNew: false };
  }

  // Procesar producto
  async processProduct(productData, brandId, categoryId, subcategoryId, transaction) {
    if (!productData.sku) {
      throw new Error('SKU es requerido');
    }

    // Verificar si el producto ya existe
    let product = await Product.findOne({
      where: { 
        sku: productData.sku,
        is_active: true
      },
      transaction
    });

    const productDataToSave = {
      sku: productData.sku,
      name: productData.nombre,
      description: productData.descripcion,
      brand_id: brandId,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      price: parseFloat(productData.precio) || 0,
      stock_quantity: parseInt(productData.stock) || 0,
      min_stock_level: parseInt(productData.stock_minimo) || 5,
      weight: productData.peso ? parseFloat(productData.peso) : null,
      dimensions: productData.dimensiones || null,
      main_image: productData.imagen || null,
      is_active: true
    };

    if (product) {
      // Actualizar producto existente
      await product.update(productDataToSave, { transaction });
      return { ...product.toJSON(), isNew: false };
    } else {
      // Crear nuevo producto
      product = await Product.create(productDataToSave, { transaction });
      return { ...product.toJSON(), isNew: true };
    }
  }

  // Procesar características del producto
  async processProductFeatures(featuresText, productId, transaction) {
    if (!featuresText || typeof featuresText !== 'string') return 0;

    // Dividir características por punto y coma o coma
    const features = featuresText.split(/[;,]|\n/).map(f => f.trim()).filter(f => f.length > 0);
    
    let createdCount = 0;
    for (let i = 0; i < features.length; i++) {
      const featureText = features[i];
      if (featureText.length > 0) {
        await ProductFeature.create({
          product_id: productId,
          feature_text: featureText,
          sort_order: i + 1
        }, { transaction });
        createdCount++;
      }
    }
    
    return createdCount;
  }

  // Procesar aplicaciones del producto
  async processProductApplications(applicationsText, productId, transaction) {
    if (!applicationsText || typeof applicationsText !== 'string') return 0;

    // Dividir aplicaciones por punto y coma o coma
    const applications = applicationsText.split(/[;,]|\n/).map(a => a.trim()).filter(a => a.length > 0);
    
    let createdCount = 0;
    for (let i = 0; i < applications.length; i++) {
      const applicationText = applications[i];
      if (applicationText.length > 0) {
        await ProductApplication.create({
          product_id: productId,
          application_text: applicationText,
          sort_order: i + 1
        }, { transaction });
        createdCount++;
      }
    }
    
    return createdCount;
  }

  // Validar datos antes de importar
  validateImportData(data) {
    const errors = [];
    
    data.forEach((row, index) => {
      const rowNumber = index + 2;
      
      if (!row.sku) {
        errors.push(`Fila ${rowNumber}: SKU es requerido`);
      }
      
      if (!row.nombre) {
        errors.push(`Fila ${rowNumber}: Nombre es requerido`);
      }
      
      if (!row.marca) {
        errors.push(`Fila ${rowNumber}: Marca es requerida`);
      }
      
      if (!row.categoria) {
        errors.push(`Fila ${rowNumber}: Categoría es requerida`);
      }
      
      if (row.precio && isNaN(parseFloat(row.precio))) {
        errors.push(`Fila ${rowNumber}: Precio debe ser un número válido`);
      }
      
      if (row.stock && isNaN(parseInt(row.stock))) {
        errors.push(`Fila ${rowNumber}: Stock debe ser un número entero válido`);
      }
    });
    
    return errors;
  }
}

module.exports = new ImportService();
