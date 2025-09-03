const multer = require('multer');
const ExcelJS = require('exceljs');
const importService = require('../services/ImportService');
const { mapColumnValueByConfig } = require('../config/columnMapping');

// Configuración de multer para subir archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV y Excel'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

// Función para procesar el valor de una celda
const processCellValue = (cell) => {
  if (!cell || cell.value === null || cell.value === undefined) {
    return '';
  }
  
  if (typeof cell.value === 'object' && cell.value.text) {
    return cell.value.text.toString().trim();
  }
  
  return cell.value.toString().trim();
};

// Función para encontrar el valor de una columna usando mapeo inteligente
const findColumnValue = (rowData, possibleNames) => {
  for (const name of possibleNames) {
    // Buscar exacto
    if (rowData[name] !== undefined && rowData[name] !== null && rowData[name] !== '') {
      return rowData[name];
    }
    
    // Buscar en minúsculas
    const lowerName = name.toLowerCase();
    for (const key of Object.keys(rowData)) {
      if (key.toLowerCase() === lowerName && rowData[key] !== undefined && rowData[key] !== null && rowData[key] !== '') {
        return rowData[key];
      }
    }
  }
  return null;
};

// Importar datos del sistema
const importSystemData = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
    }

    console.log('Procesando archivo de importación:', req.file.originalname);

    // Obtener el buffer del archivo
    const fileBuffer = req.file.buffer;

    try {
      // Leer el archivo Excel con ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      
      console.log('=== DIAGNÓSTICO DEL ARCHIVO EXCEL ===');
      console.log('Número de hojas encontradas:', workbook.worksheets.length);
      console.log('Nombres de las hojas:', workbook.worksheets.map(ws => ws.name));
      
      // Obtener la primera hoja
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No se encontró ninguna hoja en el archivo Excel');
      }
      
      console.log('Hoja seleccionada:', worksheet.name);
      console.log('=== PROCESANDO EXCEL ===');
      console.log('Total de filas:', worksheet.rowCount);

      // Leer headers de la primera fila
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value ? cell.value.toString().trim() : '';
      });

      console.log('Headers encontrados:', headers);

      // Procesar filas de datos
      const results = [];
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData = {};
        
        // Mapear cada celda a su header
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = processCellValue(cell);
          }
        });
        
        // Verificar si tiene SKU usando mapeo inteligente
        const skuValue = findColumnValue(rowData, ['sku', 'SKU', 'Sku']);
        
        // Solo procesar filas que tengan SKU
        if (skuValue && skuValue.toString().trim()) {
          console.log(`Procesando fila ${rowNumber} - SKU: ${skuValue}`);
          
          // Normalizar los datos para el servicio
          const normalizedData = {
            sku: findColumnValue(rowData, ['sku', 'SKU', 'Sku']),
            nombre: findColumnValue(rowData, ['nombre', 'Nombre', 'NOMBRE', 'name', 'Name', 'NAME']),
            descripcion: findColumnValue(rowData, ['descripcion', 'Descripción', 'descripcion', 'DESCRIPCION', 'description', 'Description', 'DESCRIPTION']),
            marca: findColumnValue(rowData, ['marca', 'Marca', 'MARCA', 'brand', 'Brand', 'BRAND', 'fabricante', 'Fabricante', 'FABRICANTE']),
            categoria: findColumnValue(rowData, ['categoria', 'Categoria', 'Categoría', 'CATEGORIA', 'category', 'Category', 'CATEGORY']),
            subcategoria: findColumnValue(rowData, ['subcategoria', 'Subcategoria', 'Subcategoría', 'SUBCATEGORIA', 'subcategory', 'Subcategory', 'SUBCATEGORY']),
            precio: findColumnValue(rowData, ['precio', 'Precio', 'PRECIO', 'price', 'Price', 'PRICE']),
            stock: findColumnValue(rowData, ['stock', 'Stock', 'STOCK', 'cantidad', 'Cantidad', 'CANTIDAD']),
            stock_minimo: findColumnValue(rowData, ['stock_minimo', 'Stock Mínimo', 'stock minimo', 'Stock Minimo', 'STOCK_MINIMO', 'min_stock', 'Min Stock']),
            peso: findColumnValue(rowData, ['peso', 'Peso', 'PESO', 'weight', 'Weight', 'WEIGHT']),
            dimensiones: findColumnValue(rowData, ['dimensiones', 'Dimensiones', 'DIMENSIONES', 'dimensions', 'Dimensions', 'DIMENSIONS']),
            imagen: findColumnValue(rowData, ['imagen', 'Imagen', 'IMAGEN', 'image', 'Image', 'IMAGE', 'foto', 'Foto', 'FOTO']),
            sku_ec: findColumnValue(rowData, ['sku_ec', 'SKU_EC', 'Sku_EC', 'sku ec', 'SKU EC']),
            potencia_kw: findColumnValue(rowData, ['potencia_kw', 'Potencia (kW)', 'potencia', 'Potencia', 'POTENCIA', 'power', 'Power', 'POWER', 'kw', 'KW']),
            voltaje: findColumnValue(rowData, ['voltaje', 'Voltaje', 'VOLTAJE', 'voltage', 'Voltage', 'VOLTAGE', 'v', 'V']),
            frame_size: findColumnValue(rowData, ['frame_size', 'Frame Size', 'frame', 'Frame', 'FRAME', 'tamaño', 'Tamaño', 'TAMAÑO']),
            corriente: findColumnValue(rowData, ['corriente', 'Corriente', 'CORRIENTE', 'current', 'Current', 'CURRENT', 'amperios', 'Amperios', 'AMPERIOS', 'a', 'A']),
            comunicacion: findColumnValue(rowData, ['comunicacion', 'Comunicación', 'COMUNICACION', 'communication', 'Communication', 'COMMUNICATION', 'protocolo', 'Protocolo', 'PROTOCOLO']),
            alimentacion: findColumnValue(rowData, ['alimentacion', 'Alimentacion', 'alimentación', 'Alimentación', 'ALIMENTACION', 'power_supply', 'Power Supply', 'POWER_SUPPLY', 'fuente', 'Fuente', 'FUENTE']),
            caracteristicas: findColumnValue(rowData, ['caracteristicas', 'Características', 'caracteristicas', 'CARACTERISTICAS', 'features', 'Features', 'FEATURES', 'especificaciones', 'Especificaciones', 'ESPECIFICACIONES']),
            aplicaciones: findColumnValue(rowData, ['aplicaciones', 'Aplicaciones', 'aplicaciones', 'APLICACIONES', 'applications', 'Applications', 'APPLICATIONS', 'usos', 'Usos', 'USOS']),
            accesorios: findColumnValue(rowData, ['accesorios', 'Accesorios', 'ACCESORIOS', 'accesorios_compatibles', 'Accesorios compatibles', 'accessories', 'Accessories', 'ACCESSORIES', 'compatibles', 'Compatibles', 'COMPATIBLES']),
            productos_relacionados: findColumnValue(rowData, ['productos_relacionados', 'Productos relacionados', 'equipos_relacionados', 'Equipos relacionados', 'related_products', 'Related Products', 'RELATED_PRODUCTS', 'relacionados', 'Relacionados', 'RELACIONADOS'])
          };
          
          results.push(normalizedData);
        }
      }

      console.log('Total de filas procesadas:', results.length);

      // Importar datos usando el servicio
      const importResults = await importService.importSystemData(results);
      
      res.json({
        success: true,
        message: 'Importación completada exitosamente',
        results: importResults
      });

    } catch (error) {
      console.error('Error procesando archivo:', error);
      res.status(500).json({
        success: false,
        error: `Error procesando archivo: ${error.message}`
      });
    }
  } catch (error) {
    console.error('Error en importSystemData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Previsualizar datos de importación
const previewImportData = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
    }

    console.log('Previsualizando archivo:', req.file.originalname);

    // Obtener el buffer del archivo
    const fileBuffer = req.file.buffer;

    try {
      // Verificar que el archivo no esté vacío
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('El archivo está vacío o corrupto');
      }

      // Leer el archivo Excel con ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      
      console.log('=== DIAGNÓSTICO DEL ARCHIVO EXCEL (PREVIEW) ===');
      console.log('Número de hojas encontradas:', workbook.worksheets.length);
      console.log('Nombres de las hojas:', workbook.worksheets.map(ws => ws.name));
      
      // Obtener la primera hoja
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No se encontró ninguna hoja en el archivo Excel');
      }
      
      console.log('Hoja seleccionada:', worksheet.name);
      console.log('=== PREVIEW EXCEL ===');
      console.log('Total de filas:', worksheet.rowCount);

      // Leer headers de la primera fila
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value ? cell.value.toString().trim() : '';
      });

      console.log('Headers encontrados:', headers);

      // Procesar todas las filas de datos para preview
      const results = [];
      
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData = {};
        
        // Mapear cada celda a su header
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = processCellValue(cell);
          }
        });
        
        // Verificar si tiene SKU usando mapeo inteligente
        const skuValue = findColumnValue(rowData, ['sku', 'SKU', 'Sku']);
        
        // Solo procesar filas que tengan SKU
        if (skuValue && skuValue.toString().trim()) {
          // Normalizar los datos para el preview
          const normalizedData = {
            sku: findColumnValue(rowData, ['sku', 'SKU', 'Sku']),
            nombre: findColumnValue(rowData, ['nombre', 'Nombre', 'NOMBRE', 'name', 'Name', 'NAME']),
            descripcion: findColumnValue(rowData, ['descripcion', 'Descripción', 'descripcion', 'DESCRIPCION', 'description', 'Description', 'DESCRIPTION']),
            marca: findColumnValue(rowData, ['marca', 'Marca', 'MARCA', 'brand', 'Brand', 'BRAND', 'fabricante', 'Fabricante', 'FABRICANTE']),
            categoria: findColumnValue(rowData, ['categoria', 'Categoria', 'Categoría', 'CATEGORIA', 'category', 'Category', 'CATEGORY']),
            subcategoria: findColumnValue(rowData, ['subcategoria', 'Subcategoria', 'Subcategoría', 'SUBCATEGORIA', 'subcategory', 'Subcategory', 'SUBCATEGORY']),
            precio: findColumnValue(rowData, ['precio', 'Precio', 'PRECIO', 'price', 'Price', 'PRICE']),
            stock: findColumnValue(rowData, ['stock', 'Stock', 'STOCK', 'cantidad', 'Cantidad', 'CANTIDAD']),
            stock_minimo: findColumnValue(rowData, ['stock_minimo', 'Stock Mínimo', 'stock minimo', 'Stock Minimo', 'STOCK_MINIMO', 'min_stock', 'Min Stock']),
            peso: findColumnValue(rowData, ['peso', 'Peso', 'PESO', 'weight', 'Weight', 'WEIGHT']),
            dimensiones: findColumnValue(rowData, ['dimensiones', 'Dimensiones', 'DIMENSIONES', 'dimensions', 'Dimensions', 'DIMENSIONS']),
            imagen: findColumnValue(rowData, ['imagen', 'Imagen', 'IMAGEN', 'image', 'Image', 'IMAGE', 'foto', 'Foto', 'FOTO']),
            sku_ec: findColumnValue(rowData, ['sku_ec', 'SKU_EC', 'Sku_EC', 'sku ec', 'SKU EC']),
            potencia_kw: findColumnValue(rowData, ['potencia_kw', 'Potencia (kW)', 'potencia', 'Potencia', 'POTENCIA', 'power', 'Power', 'POWER', 'kw', 'KW']),
            voltaje: findColumnValue(rowData, ['voltaje', 'Voltaje', 'VOLTAJE', 'voltage', 'Voltage', 'VOLTAGE', 'v', 'V']),
            frame_size: findColumnValue(rowData, ['frame_size', 'Frame Size', 'frame', 'Frame', 'FRAME', 'tamaño', 'Tamaño', 'TAMAÑO']),
            corriente: findColumnValue(rowData, ['corriente', 'Corriente', 'CORRIENTE', 'current', 'Current', 'CURRENT', 'amperios', 'Amperios', 'AMPERIOS', 'a', 'A']),
            comunicacion: findColumnValue(rowData, ['comunicacion', 'Comunicación', 'COMUNICACION', 'communication', 'Communication', 'COMMUNICATION', 'protocolo', 'Protocolo', 'PROTOCOLO']),
            alimentacion: findColumnValue(rowData, ['alimentacion', 'Alimentacion', 'alimentación', 'Alimentación', 'ALIMENTACION', 'power_supply', 'Power Supply', 'POWER_SUPPLY', 'fuente', 'Fuente', 'FUENTE']),
            caracteristicas: findColumnValue(rowData, ['caracteristicas', 'Características', 'caracteristicas', 'CARACTERISTICAS', 'features', 'Features', 'FEATURES', 'especificaciones', 'Especificaciones', 'ESPECIFICACIONES']),
            aplicaciones: findColumnValue(rowData, ['aplicaciones', 'Aplicaciones', 'aplicaciones', 'APLICACIONES', 'applications', 'Applications', 'APPLICATIONS', 'usos', 'Usos', 'USOS']),
            accesorios: findColumnValue(rowData, ['accesorios', 'Accesorios', 'ACCESORIOS', 'accesorios_compatibles', 'Accesorios compatibles', 'accessories', 'Accessories', 'ACCESSORIES', 'compatibles', 'Compatibles', 'COMPATIBLES']),
            productos_relacionados: findColumnValue(rowData, ['productos_relacionados', 'Productos relacionados', 'equipos_relacionados', 'Equipos relacionados', 'related_products', 'Related Products', 'RELATED_PRODUCTS', 'relacionados', 'Relacionados', 'RELACIONADOS'])
          };
          
          results.push(normalizedData);
        }
      }

      console.log('Total de filas en preview:', results.length);

      // Validar datos
      const validationErrors = importService.validateImportData(results);
      
      res.json({
        success: true,
        data: {
          preview: results,
          total_rows: results.length,
          validation_errors: validationErrors,
          can_import: validationErrors.length === 0
        }
      });

    } catch (error) {
      console.error('Error procesando archivo:', error);
      res.status(500).json({
        success: false,
        error: `Error procesando archivo: ${error.message}`
      });
    }
  } catch (error) {
    console.error('Error en previewImportData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  importSystemData: [upload.single('file'), importSystemData],
  previewImportData: [upload.single('file'), previewImportData]
};