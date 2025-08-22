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
        accessories_created: 0,
        related_products_created: 0,
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

          // Procesar accesorios si existen
          if (row.accesorios) {
            const accessoriesCount = await this.processProductAccessories(row.accesorios, productResult.id, transaction);
            results.accessories_created += accessoriesCount;
          }

          // Procesar productos relacionados si existen
          if (row.productos_relacionados) {
            const relatedCount = await this.processProductRelated(row.productos_relacionados, productResult.id, transaction);
            results.related_products_created += relatedCount;
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

  // Procesar accesorios del producto
  async processProductAccessories(accessoriesText, productId, transaction) {
    if (!accessoriesText || typeof accessoriesText !== 'string') return 0;

    // Dividir accesorios por punto y coma o coma
    const accessories = accessoriesText.split(/[;,]|\n/).map(a => a.trim()).filter(a => a.length > 0);
    
    let createdCount = 0;
    for (let i = 0; i < accessories.length; i++) {
      const accessorySku = accessories[i];
      if (accessorySku.length > 0) {
        // Buscar el producto accesorio por SKU
        const accessoryProduct = await Product.findOne({
          where: { sku: accessorySku, is_active: true },
          transaction
        });
        
        if (accessoryProduct) {
          // Crear la relación de accesorio
          await require('../models').Accessory.create({
            main_product_id: productId,
            accessory_product_id: accessoryProduct.id,
            sort_order: i + 1
          }, { transaction });
          createdCount++;
        }
      }
    }
    
    return createdCount;
  }

  // Procesar productos relacionados del producto
  async processProductRelated(relatedText, productId, transaction) {
    if (!relatedText || typeof relatedText !== 'string') return 0;

    // Dividir productos relacionados por punto y coma o coma
    const related = relatedText.split(/[;,]|\n/).map(r => r.trim()).filter(r => r.length > 0);
    
    let createdCount = 0;
    for (let i = 0; i < related.length; i++) {
      const relatedItem = related[i];
      if (relatedItem.length > 0) {
        // Formato esperado: "SKU:Tipo" o solo "SKU"
        const [relatedSku, relationshipType] = relatedItem.split(':');
        
        if (relatedSku) {
          // Buscar el producto relacionado por SKU
          const relatedProduct = await Product.findOne({
            where: { sku: relatedSku.trim(), is_active: true },
            transaction
          });
          
          if (relatedProduct) {
            // Crear la relación
            await require('../models').RelatedProduct.create({
              product_id: productId,
              related_product_id: relatedProduct.id,
              relationship_type: relationshipType ? relationshipType.trim() : 'Relacionado',
              sort_order: i + 1
            }, { transaction });
            createdCount++;
          }
        }
      }
    }
    
    return createdCount;
  }

  // Validar datos antes de importar
  validateImportData(data) {
    const errors = [];
    
    console.log('=== VALIDACIÓN DE DATOS ===');
    console.log('Total de filas a validar:', data.length);
    console.log('Primera fila:', data[0]);
    console.log('Claves de la primera fila:', Object.keys(data[0]));
    
    data.forEach((row, index) => {
      const rowNumber = index + 2;
      
      // console.log(`Validando fila ${rowNumber}:`, row);
      // console.log(`SKU en fila ${rowNumber}:`, row.sku);
      
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
      
      console.log(`Fila ${rowNumber} - Precio: "${row.precio}" (tipo: ${typeof row.precio})`);
      console.log(`Fila ${rowNumber} - Stock: "${row.stock}" (tipo: ${typeof row.stock})`);
      
      // Validar precio solo si existe
      if (row.precio !== undefined && row.precio !== null && row.precio !== '') {
        const precioNum = parseFloat(row.precio);
        if (isNaN(precioNum)) {
          errors.push(`Fila ${rowNumber}: Precio debe ser un número válido (valor: "${row.precio}")`);
        }
      }
      
      // Validar stock solo si existe
      if (row.stock !== undefined && row.stock !== null && row.stock !== '') {
        const stockNum = parseInt(row.stock);
        if (isNaN(stockNum)) {
          errors.push(`Fila ${rowNumber}: Stock debe ser un número entero válido (valor: "${row.stock}")`);
        }
      }
    });
    
    return errors;
  }
}

module.exports = new ImportService();
