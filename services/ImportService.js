const {
  Product,
  Brand,
  Category,
  Subcategory,
  ProductFeature,
  ProductApplication,
} = require("../models");
const { Op } = require("sequelize");
const { mapColumnValueByConfig } = require("../config/columnMapping");

class ImportService {
  // Importar datos del sistema desde un archivo
  async importSystemData(data) {
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
      errors: [],
    };

    console.log('=== INICIANDO IMPORTACIÓN OPTIMIZADA ===');
    console.log('Total de filas a procesar:', data.length);

    // Usar una sola transacción para todo el proceso
    const transaction = await require("../models").sequelize.transaction();
    console.log('Transacción creada:', transaction.id);

    try {
      // PASO 1: Procesar todas las marcas únicas
      console.log('=== PASO 1: PROCESANDO MARCAS ===');
      const uniqueBrands = [...new Set(data.map(row => row.marca).filter(Boolean))];
      const brandMap = new Map();
      
      for (const brandName of uniqueBrands) {
        const brand = await this.processBrand(brandName, transaction);
        brandMap.set(brandName, brand);
        if (brand.isNew) results.brands_created++;
        else results.brands_existing++;
      }
      console.log(`Marcas procesadas: ${uniqueBrands.length}`);

      // PASO 2: Procesar todas las categorías únicas
      console.log('=== PASO 2: PROCESANDO CATEGORÍAS ===');
      const uniqueCategories = [...new Set(data.map(row => row.categoria).filter(Boolean))];
      const categoryMap = new Map();
      
      for (const categoryName of uniqueCategories) {
        const category = await this.processCategory(categoryName, transaction);
        categoryMap.set(categoryName, category);
        if (category.isNew) results.categories_created++;
        else results.categories_existing++;
      }
      console.log(`Categorías procesadas: ${uniqueCategories.length}`);

      // PASO 3: Procesar todas las subcategorías únicas
      console.log('=== PASO 3: PROCESANDO SUBCATEGORÍAS ===');
      const uniqueSubcategories = [...new Set(data.map(row => row.subcategoria).filter(Boolean))];
      const subcategoryMap = new Map();
      
      for (const subcategoryName of uniqueSubcategories) {
        // Encontrar la categoría correspondiente
        const categoryForSubcategory = data.find(row => row.subcategoria === subcategoryName);
        const category = categoryMap.get(categoryForSubcategory.categoria);
        
        const subcategory = await this.processSubcategory(subcategoryName, category.id, transaction);
        subcategoryMap.set(subcategoryName, subcategory);
        if (subcategory.isNew) results.subcategories_created++;
        else results.subcategories_existing++;
      }
      console.log(`Subcategorías procesadas: ${uniqueSubcategories.length}`);

      // PASO 4: Procesar todos los productos en lote
      console.log('=== PASO 4: PROCESANDO PRODUCTOS ===');
      const productsToCreate = [];
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2;
        
        try {
          // Validar datos requeridos
          if (!row.sku || !row.nombre) {
            throw new Error('SKU y Nombre son requeridos');
          }

          const brand = brandMap.get(row.marca);
          const category = categoryMap.get(row.categoria);
          const subcategory = subcategoryMap.get(row.subcategoria);

          const productData = {
            sku: row.sku,
            sku_ec: row.sku_ec || null,
            name: row.nombre,
            description: row.descripcion || null,
            brand_id: brand.id,
            category_id: category.id,
            subcategory_id: subcategory.id,
            price: row.precio || null,
            stock_quantity: row.stock || null,
            min_stock_level: row.stock_minimo || null,
            weight: row.peso || null,
            potencia_kw: row.potencia_kw || null,
            voltaje: row.voltaje || null,
            frame_size: row.frame_size || null,
            corriente: row.corriente || null,
            comunicacion: row.comunicacion || null,
            alimentacion: row.alimentacion || null,
            dimensions: row.dimensiones || null,
            main_image: row.imagen || null,
            is_active: true,
          };

          productsToCreate.push(productData);
        } catch (error) {
          console.error(`Error en fila ${rowNumber}:`, error.message);
          results.errors.push({
            row: rowNumber,
            error: error.message,
            data: row,
          });
        }
      }

      // Crear todos los productos en lote
      if (productsToCreate.length > 0) {
        console.log(`Creando ${productsToCreate.length} productos en lote...`);
        await Product.bulkCreate(productsToCreate, { 
          transaction,
          ignoreDuplicates: true // Ignorar duplicados por SKU
        });
        results.products_created = productsToCreate.length;
        console.log(`Productos creados: ${productsToCreate.length}`);
      }

      // PASO 5: Procesar accesorios y productos relacionados en lote (ULTRA OPTIMIZADO)
      console.log('=== PASO 5: PROCESANDO ACCESORIOS Y PRODUCTOS RELACIONADOS EN LOTE ===');
      const relationsResults = await this.processAllRelationsAndAccessoriesInBulk(data, transaction);
      
      // Actualizar resultados
      results.accessories_created += relationsResults.accessories_created;
      results.related_products_created += relationsResults.related_products_created;
      results.errors.push(...relationsResults.errors);

      console.log('Haciendo commit de la transacción...');
      await transaction.commit();
      console.log('=== IMPORTACIÓN COMPLETADA EXITOSAMENTE ===');
      
    } catch (error) {
      console.error('Error en la importación, haciendo rollback...');
      console.error('Estado de la transacción:', transaction.finished);
      try {
        await transaction.rollback();
        console.log('Rollback completado');
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError.message);
      }
      console.error('Error en la importación:', error);
      throw error;
    }

    return results;
  }

  // Procesar marca (crear si no existe)
  async processBrand(brandName, transaction) {
    console.log('=== PROCESANDO MARCA ===');
    console.log('Nombre de marca recibido:', brandName);
    
    if (!brandName) {
      // Si no hay marca, crear una por defecto
      brandName = "Sin Marca";
      console.log('Marca vacía, usando por defecto:', brandName);
    }

    let brand = await Brand.findOne({
      where: {
        name: { [Op.iLike]: brandName },
      },
      transaction,
    });

    console.log('Marca existente encontrada:', !!brand);
    if (brand) {
      console.log('Marca existente:', brand.name, 'Activa:', brand.is_active);
      
      // Si la marca existe pero está inactiva, reactivarla
      if (!brand.is_active) {
        console.log('Reactivando marca inactiva:', brandName);
        brand.is_active = true;
        await brand.save({ transaction });
        console.log('Marca reactivada exitosamente:', brand.name);
        return { ...brand.toJSON(), isNew: false };
      }
    }

    if (!brand) {
      console.log('Creando nueva marca:', brandName);
      try {
        brand = await Brand.create(
          {
            name: brandName,
            description: `Marca importada: ${brandName}`,
            is_active: true,
          },
          { transaction }
        );
        console.log('Marca creada exitosamente:', brand.name);
        return { ...brand.toJSON(), isNew: true };
      } catch (error) {
        console.error('Error creando marca:', error);
        console.error('Datos de la marca:', {
          name: brandName,
          description: `Marca importada: ${brandName}`,
          is_active: true,
        });
        throw error;
      }
    }

    return { ...brand.toJSON(), isNew: false };
  }

  // Procesar categoría (crear si no existe)
  async processCategory(categoryName, transaction) {
    console.log('=== PROCESANDO CATEGORÍA ===');
    console.log('Nombre de categoría recibido:', categoryName);
    
    if (!categoryName) {
      // Si no hay categoría, crear una por defecto
      categoryName = "General";
      console.log('Categoría vacía, usando por defecto:', categoryName);
    }

    let category = await Category.findOne({
      where: {
        name: { [Op.iLike]: categoryName },
      },
      transaction,
    });

    console.log('Categoría existente encontrada:', !!category);
    if (category) {
      console.log('Categoría existente:', category.name, 'Activa:', category.is_active);
      
      // Si la categoría existe pero está inactiva, reactivarla
      if (!category.is_active) {
        console.log('Reactivando categoría inactiva:', categoryName);
        category.is_active = true;
        await category.save({ transaction });
        console.log('Categoría reactivada exitosamente:', category.name);
        return { ...category.toJSON(), isNew: false };
      }
    }

    if (!category) {
      console.log('Creando nueva categoría:', categoryName);
      try {
        category = await Category.create(
          {
            name: categoryName,
            description: `Categoría importada: ${categoryName}`,
            icon: "fas fa-folder",
            color: "#3B82F6",
            is_active: true,
          },
          { transaction }
        );
        console.log('Categoría creada exitosamente:', category.name);
        return { ...category.toJSON(), isNew: true };
      } catch (error) {
        console.error('Error creando categoría:', error);
        console.error('Datos de la categoría:', {
          name: categoryName,
          description: `Categoría importada: ${categoryName}`,
          icon: "fas fa-folder",
          color: "#3B82F6",
          is_active: true,
        });
        throw error;
      }
    }

    return { ...category.toJSON(), isNew: false };
  }

  // Procesar subcategoría (crear si no existe)
  async processSubcategory(subcategoryName, categoryId, transaction) {
    if (!subcategoryName) {
      // Si no hay subcategoría, crear una por defecto
      subcategoryName = "General";
    }

    let subcategory = await Subcategory.findOne({
      where: {
        name: { [Op.iLike]: subcategoryName },
        category_id: categoryId,
      },
      transaction,
    });

    if (subcategory) {
      // Si la subcategoría existe pero está inactiva, reactivarla
      if (!subcategory.is_active) {
        subcategory.is_active = true;
        await subcategory.save({ transaction });
        return { ...subcategory.toJSON(), isNew: false };
      }
    }

    if (!subcategory) {
      subcategory = await Subcategory.create(
        {
          name: subcategoryName,
          description: `Subcategoría importada: ${subcategoryName}`,
          category_id: categoryId,
          is_active: true,
        },
        { transaction }
      );

      return { ...subcategory.toJSON(), isNew: true };
    }

    return { ...subcategory.toJSON(), isNew: false };
  }

  // Procesar producto
  async processProduct(
    productData,
    brandId,
    categoryId,
    subcategoryId,
    transaction
  ) {
    // Usar datos normalizados directamente
    const skuValue = productData.sku;
    
    console.log('=== PROCESANDO PRODUCTO ===');
    console.log('SKU:', skuValue);
    console.log('Nombre:', productData.nombre);
    console.log('Brand ID:', brandId);
    console.log('Category ID:', categoryId);
    console.log('Subcategory ID:', subcategoryId);
    console.log('Datos del producto:', productData);
    
    if (!skuValue || !skuValue.toString().trim()) {
      throw new Error("SKU es requerido");
    }

    // Verificar si el producto ya existe
    let product = await Product.findOne({
      where: {
        sku: skuValue,
        is_active: true,
      },
      transaction,
    });
    
    console.log('Producto existente encontrado:', !!product);

    // Verificar si ya existe un producto con el mismo sku_ec
    let skuEcValue = productData.sku_ec || null;
    if (skuEcValue) {
      const existingProductWithSkuEc = await Product.findOne({
        where: {
          sku_ec: skuEcValue,
          is_active: true,
        },
        transaction,
      });
      
      if (existingProductWithSkuEc) {
        console.log(`SKU_EC ${skuEcValue} ya existe, se establecerá como null`);
        skuEcValue = null;
      }
    }

    const productDataToSave = {
      sku: skuValue,
      sku_ec: skuEcValue, // Opcional, manejado arriba
      name: productData.nombre,
      description: productData.descripcion || null,
      brand_id: brandId,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      price: productData.precio || null,
      stock_quantity: productData.stock || null,
      min_stock_level: productData.stock_minimo || null,
      weight: productData.peso || null,
      potencia_kw: productData.potencia_kw || null,
      voltaje: productData.voltaje || null,
      frame_size: productData.frame_size || null,
      corriente: productData.corriente || null,
      comunicacion: productData.comunicacion || null,
      alimentacion: productData.alimentacion || null,
      dimensions: productData.dimensiones || null,
      main_image: productData.imagen || null,
      is_active: true,
    };

    if (product) {
      // Actualizar producto existente
      console.log('Actualizando producto existente:', product.id);
      await product.update(productDataToSave, { transaction });
      return { ...product.toJSON(), isNew: false };
    } else {
      // Crear nuevo producto
      console.log('Creando nuevo producto con datos:', productDataToSave);
      try {
        product = await Product.create(productDataToSave, { transaction });
        console.log('Producto creado exitosamente:', product.id);
        return { ...product.toJSON(), isNew: true };
      } catch (createError) {
        console.error('Error creando producto:', createError.message);
        console.error('Datos que causaron el error:', productDataToSave);
        console.error('Tipo de error:', createError.name);
        if (createError.errors) {
          console.error('Errores de validación:', createError.errors);
        }
        throw createError;
      }
    }
  }

  // Procesar características del producto
  async processProductFeatures(featuresText, productId, transaction) {
    if (!featuresText || typeof featuresText !== "string") return 0;

    // Dividir características por punto y coma o coma
    const features = featuresText
      .split(/[;,]|\n/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    let createdCount = 0;
    for (let i = 0; i < features.length; i++) {
      const featureText = features[i];
      if (featureText.length > 0) {
        await ProductFeature.create(
          {
            product_id: productId,
            feature_text: featureText,
            sort_order: i + 1,
          },
          { transaction }
        );
        createdCount++;
      }
    }

    return createdCount;
  }

  // Procesar aplicaciones del producto
  async processProductApplications(applicationsText, productId, transaction) {
    if (!applicationsText || typeof applicationsText !== "string") return 0;

    // Dividir aplicaciones por punto y coma o coma
    const applications = applicationsText
      .split(/[;,]|\n/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    let createdCount = 0;
    for (let i = 0; i < applications.length; i++) {
      const applicationText = applications[i];
      if (applicationText.length > 0) {
        await ProductApplication.create(
          {
            product_id: productId,
            application_text: applicationText,
            sort_order: i + 1,
          },
          { transaction }
        );
        createdCount++;
      }
    }

    return createdCount;
  }

  // Procesar accesorios del producto (OPTIMIZADO)
  async processProductAccessories(accessoriesText, productId, transaction) {
    if (!accessoriesText || typeof accessoriesText !== "string") return 0;

    console.log(`Procesando accesorios para producto ${productId}: ${accessoriesText}`);

    // PASO 1: Eliminar todos los accesorios existentes para este producto
    const Accessory = require("../models").Accessory;
    const deletedCount = await Accessory.destroy({
      where: { main_product_id: productId },
      transaction
    });
    console.log(`Eliminados ${deletedCount} accesorios existentes para producto ${productId}`);

    // PASO 2: Dividir accesorios por punto y coma o coma
    const accessories = accessoriesText
      .split(/[;,]|\n/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    if (accessories.length === 0) return 0;

    // PASO 3: Buscar todos los productos accesorio en una sola consulta
    const accessoryProducts = await Product.findAll({
      where: { 
        sku: { [Op.in]: accessories },
        is_active: true 
      },
      transaction
    });

    console.log(`Encontrados ${accessoryProducts.length} productos accesorio de ${accessories.length} SKUs`);

    // PASO 4: Crear mapa de SKU a ID para acceso rápido
    const skuToIdMap = new Map();
    accessoryProducts.forEach(product => {
      skuToIdMap.set(product.sku, product.id);
    });

    // PASO 5: Preparar datos para inserción en lote
    const accessoriesToCreate = [];
    
    for (let i = 0; i < accessories.length; i++) {
      const accessorySku = accessories[i];
      if (accessorySku && skuToIdMap.has(accessorySku)) {
        accessoriesToCreate.push({
          main_product_id: productId,
          accessory_product_id: skuToIdMap.get(accessorySku),
          sort_order: i + 1,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    // PASO 6: Crear todos los accesorios en lote
    if (accessoriesToCreate.length > 0) {
      console.log(`Creando ${accessoriesToCreate.length} accesorios en lote para producto ${productId}`);
      await Accessory.bulkCreate(accessoriesToCreate, { 
        transaction,
        ignoreDuplicates: true 
      });
    }

    console.log(`Accesorios procesados: ${accessoriesToCreate.length}`);
    return accessoriesToCreate.length;
  }

  // Procesar productos relacionados del producto (OPTIMIZADO)
  async processProductRelated(relatedText, productId, transaction) {
    if (!relatedText || typeof relatedText !== "string") return 0;

    console.log(`Procesando productos relacionados para producto ${productId}: ${relatedText}`);

    // PASO 1: Eliminar todas las relaciones existentes para este producto
    const RelatedProduct = require("../models").RelatedProduct;
    const deletedCount = await RelatedProduct.destroy({
      where: { product_id: productId },
      transaction
    });
    console.log(`Eliminadas ${deletedCount} relaciones existentes para producto ${productId}`);

    // PASO 2: Dividir productos relacionados por punto y coma o coma
    const related = relatedText
      .split(/[;,]|\n/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (related.length === 0) return 0;

    // PASO 3: Obtener todos los SKUs únicos para buscar en lote
    const relatedSkus = related.map(item => {
      const [relatedSku] = item.split(":");
      return relatedSku ? relatedSku.trim() : null;
    }).filter(Boolean);

    if (relatedSkus.length === 0) return 0;

    // PASO 4: Buscar todos los productos relacionados en una sola consulta
    const relatedProducts = await Product.findAll({
      where: { 
        sku: { [Op.in]: relatedSkus },
        is_active: true 
      },
      transaction
    });

    console.log(`Encontrados ${relatedProducts.length} productos relacionados de ${relatedSkus.length} SKUs`);

    // PASO 5: Crear mapa de SKU a ID para acceso rápido
    const skuToIdMap = new Map();
    relatedProducts.forEach(product => {
      skuToIdMap.set(product.sku, product.id);
    });

    // PASO 6: Preparar datos para inserción en lote
    const relationsToCreate = [];
    
    for (let i = 0; i < related.length; i++) {
      const relatedItem = related[i];
      if (relatedItem.length > 0) {
        // Formato esperado: "SKU:Tipo" o solo "SKU"
        const [relatedSku, relationshipType] = relatedItem.split(":");

        if (relatedSku && skuToIdMap.has(relatedSku.trim())) {
          relationsToCreate.push({
            product_id: productId,
            related_product_id: skuToIdMap.get(relatedSku.trim()),
            relationship_type: relationshipType ? relationshipType.trim() : "Relacionado",
            sort_order: i + 1,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    }

    // PASO 7: Crear todas las relaciones en lote
    if (relationsToCreate.length > 0) {
      console.log(`Creando ${relationsToCreate.length} relaciones en lote para producto ${productId}`);
      await RelatedProduct.bulkCreate(relationsToCreate, { 
        transaction,
        ignoreDuplicates: true 
      });
    }

    console.log(`Productos relacionados procesados: ${relationsToCreate.length}`);
    return relationsToCreate.length;
  }

  // Procesar todas las relaciones y accesorios en lote (ULTRA OPTIMIZADO)
  async processAllRelationsAndAccessoriesInBulk(data, transaction) {
    console.log('=== PROCESANDO TODAS LAS RELACIONES Y ACCESORIOS EN LOTE ===');
    
    const results = {
      accessories_created: 0,
      related_products_created: 0,
      errors: []
    };

    // PASO 1: Recopilar todos los productos con sus relaciones
    const productsWithRelations = [];
    const allAccessorySkus = new Set();
    const allRelatedSkus = new Set();
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      
      try {
        // Buscar el producto creado por SKU
        const product = await Product.findOne({
          where: { sku: row.sku, is_active: true },
          transaction
        });

        if (product && (row.accesorios || row.productos_relacionados)) {
          productsWithRelations.push({
            product,
            row,
            rowNumber
          });
          
          // Recopilar SKUs de accesorios
          if (row.accesorios) {
            const accessorySkus = row.accesorios
              .split(/[;,]|\n/)
              .map(a => a.trim())
              .filter(Boolean);
            accessorySkus.forEach(sku => allAccessorySkus.add(sku));
          }
          
          // Recopilar SKUs de productos relacionados
          if (row.productos_relacionados) {
            const relatedSkus = row.productos_relacionados
              .split(/[;,]|\n/)
              .map(r => r.trim().split(':')[0])
              .filter(Boolean);
            relatedSkus.forEach(sku => allRelatedSkus.add(sku));
          }
        }
      } catch (error) {
        console.error(`Error preparando relaciones en fila ${rowNumber}:`, error.message);
        results.errors.push({
          row: rowNumber,
          error: `Error preparando relaciones: ${error.message}`,
          data: row,
        });
      }
    }

    console.log(`Productos con relaciones a procesar: ${productsWithRelations.length}`);
    console.log(`SKUs únicos de accesorios: ${allAccessorySkus.size}`);
    console.log(`SKUs únicos de productos relacionados: ${allRelatedSkus.size}`);

    // PASO 2: Buscar todos los productos accesorio en una sola consulta
    let accessoryProducts = [];
    if (allAccessorySkus.size > 0) {
      accessoryProducts = await Product.findAll({
        where: { 
          sku: { [Op.in]: Array.from(allAccessorySkus) },
          is_active: true 
        },
        transaction
      });
      console.log(`Encontrados ${accessoryProducts.length} productos accesorio`);
    }

    // PASO 3: Buscar todos los productos relacionados en una sola consulta
    let relatedProducts = [];
    if (allRelatedSkus.size > 0) {
      relatedProducts = await Product.findAll({
        where: { 
          sku: { [Op.in]: Array.from(allRelatedSkus) },
          is_active: true 
        },
        transaction
      });
      console.log(`Encontrados ${relatedProducts.length} productos relacionados`);
    }

    // PASO 4: Crear mapas de SKU a ID para acceso rápido
    const accessorySkuToIdMap = new Map();
    accessoryProducts.forEach(product => {
      accessorySkuToIdMap.set(product.sku, product.id);
    });

    const relatedSkuToIdMap = new Map();
    relatedProducts.forEach(product => {
      relatedSkuToIdMap.set(product.sku, product.id);
    });

    // PASO 5: Preparar todos los datos para inserción en lote
    const allAccessoriesToCreate = [];
    const allRelationsToCreate = [];
    const Accessory = require("../models").Accessory;
    const RelatedProduct = require("../models").RelatedProduct;

    // PASO 6: Procesar cada producto y preparar datos
    for (const { product, row, rowNumber } of productsWithRelations) {
      try {
        // Procesar accesorios
        if (row.accesorios) {
          const accessories = row.accesorios
            .split(/[;,]|\n/)
            .map(a => a.trim())
            .filter(a => a.length > 0);

          for (let i = 0; i < accessories.length; i++) {
            const accessorySku = accessories[i];
            if (accessorySkuToIdMap.has(accessorySku)) {
              allAccessoriesToCreate.push({
                main_product_id: product.id,
                accessory_product_id: accessorySkuToIdMap.get(accessorySku),
                sort_order: i + 1,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
        }

        // Procesar productos relacionados
        if (row.productos_relacionados) {
          const related = row.productos_relacionados
            .split(/[;,]|\n/)
            .map(r => r.trim())
            .filter(r => r.length > 0);

          for (let i = 0; i < related.length; i++) {
            const relatedItem = related[i];
            const [relatedSku, relationshipType] = relatedItem.split(":");
            
            if (relatedSku && relatedSkuToIdMap.has(relatedSku.trim())) {
              allRelationsToCreate.push({
                product_id: product.id,
                related_product_id: relatedSkuToIdMap.get(relatedSku.trim()),
                relationship_type: relationshipType ? relationshipType.trim() : "Relacionado",
                sort_order: i + 1,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error procesando relaciones en fila ${rowNumber}:`, error.message);
        results.errors.push({
          row: rowNumber,
          error: `Error en relaciones: ${error.message}`,
          data: row,
        });
      }
    }

    // PASO 7: Eliminar todas las relaciones existentes en lote
    if (productsWithRelations.length > 0) {
      const productIds = productsWithRelations.map(p => p.product.id);
      
      console.log(`Eliminando relaciones existentes para ${productIds.length} productos...`);
      await Accessory.destroy({
        where: { main_product_id: { [Op.in]: productIds } },
        transaction
      });
      
      await RelatedProduct.destroy({
        where: { product_id: { [Op.in]: productIds } },
        transaction
      });
    }

    // PASO 8: Crear todas las relaciones en lote
    if (allAccessoriesToCreate.length > 0) {
      console.log(`Creando ${allAccessoriesToCreate.length} accesorios en lote...`);
      await Accessory.bulkCreate(allAccessoriesToCreate, { 
        transaction,
        ignoreDuplicates: true 
      });
      results.accessories_created = allAccessoriesToCreate.length;
    }

    if (allRelationsToCreate.length > 0) {
      console.log(`Creando ${allRelationsToCreate.length} relaciones en lote...`);
      await RelatedProduct.bulkCreate(allRelationsToCreate, { 
        transaction,
        ignoreDuplicates: true 
      });
      results.related_products_created = allRelationsToCreate.length;
    }

    console.log(`=== PROCESAMIENTO EN LOTE COMPLETADO ===`);
    console.log(`Accesorios creados: ${results.accessories_created}`);
    console.log(`Productos relacionados creados: ${results.related_products_created}`);
    console.log(`Errores: ${results.errors.length}`);

    return results;
  }

  // Validar datos antes de importar
  validateImportData(data) {
    const errors = [];

    console.log("=== VALIDACIÓN DE DATOS ===");
    console.log("Total de filas a validar:", data.length);
    console.log("Primera fila:", data[0]);
    console.log("Claves de la primera fila:", Object.keys(data[0]));

    data.forEach((row, index) => {
      const rowNumber = index + 2;

      console.log(`Validando fila ${rowNumber}:`, row);
      console.log(`Claves disponibles en fila ${rowNumber}:`, Object.keys(row));

      // Validar SKU y nombre usando datos normalizados
      console.log(`SKU encontrado en fila ${rowNumber}:`, row.sku);
      console.log(`Nombre encontrado en fila ${rowNumber}:`, row.nombre);

      // Solo SKU y nombre son requeridos
      if (!row.sku || !row.sku.toString().trim()) {
        errors.push(`Fila ${rowNumber}: SKU es requerido`);
      }

      if (!row.nombre || !row.nombre.toString().trim()) {
        errors.push(`Fila ${rowNumber}: Nombre es requerido`);
      }

      // Marca y categoría son opcionales - se crearán automáticamente si no existen

      // Validar precio solo si existe
      if (row.precio !== null && row.precio !== undefined && row.precio !== "") {
        const precioNum = parseFloat(row.precio);
        if (isNaN(precioNum)) {
          errors.push(
            `Fila ${rowNumber}: Precio debe ser un número válido (valor: "${row.precio}")`
          );
        }
      }

      // Validar stock solo si existe
      if (row.stock !== null && row.stock !== undefined && row.stock !== "") {
        const stockNum = parseInt(row.stock);
        if (isNaN(stockNum)) {
          errors.push(
            `Fila ${rowNumber}: Stock debe ser un número entero válido (valor: "${row.stock}")`
          );
        }
      }
    });

    return errors;
  }
}

module.exports = new ImportService();
