const ImportService = require('../services/ImportService');
const multer = require('multer');
const ExcelJS = require('exceljs');
const { Readable } = require('stream');

// Función para procesar valores de celdas del Excel
const processCellValue = (cell) => {
  if (!cell.value) return '';
  
  // Si es un objeto, extraer información relevante
  if (typeof cell.value === 'object') {
    // Para hipervínculos
    if (cell.value.hyperlink) {
      return cell.value.hyperlink || '';
    }
    
    // Para imágenes o archivos
    if (cell.value.text) {
      return cell.value.text || '';
    }
    
    // Para otros objetos, intentar extraer el valor principal
    if (cell.value.richText) {
      return cell.value.richText.map(rt => rt.text).join('') || '';
    }
    
    // Para fórmulas
    if (cell.value.formula) {
      return cell.value.result || '';
    }
    
    // Si no se puede procesar, convertir a string y limpiar
    const objString = JSON.stringify(cell.value);
    console.log(`⚠️ Celda con objeto complejo: ${objString}`);
    return '';
  }
  
  // Para valores simples, convertir a string
  return cell.value.toString().trim();
};

// Configuración de multer para archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(), // Almacenar en memoria en lugar de disco
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV y Excel'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

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

    // Procesar archivo Excel directamente desde el buffer
    const results = [];
    const errors = [];

    // Obtener el buffer del archivo
    const fileBuffer = req.file.buffer;

    try {
      // Leer el archivo Excel con ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      
      // Obtener la primera hoja
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No se encontró ninguna hoja en el archivo Excel');
      }
      
      console.log('=== DEBUG ARCHIVO EXCEL ===');
      console.log('Nombre de la hoja:', worksheet.name);
      console.log('Total de filas en Excel:', worksheet.rowCount);
      console.log('Filas de datos esperadas:', worksheet.rowCount - 1); // -1 por la fila de headers
      console.log('============================');

      // Obtener headers de la primera fila
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value ? cell.value.toString().toLowerCase().trim() : '';
      });

      console.log('Headers detectados:', headers);

      // Procesar filas de datos (empezar desde la fila 2)
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData = {};
        
        // Mapear cada celda a su header correspondiente
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = processCellValue(cell);
          }
        });
        
        // Solo agregar filas que tengan SKU
        if (rowData.sku && rowData.sku.trim()) {
          console.log(`Procesando fila ${rowNumber}:`, rowData);
          
          // Normalizar los datos usando nombres de columnas
          const normalizedData = {
            sku: rowData.sku || '',
            nombre: rowData.nombre || '',
            descripcion: rowData.descripcion || '',
            marca: rowData.marca || '',
            categoria: rowData.categoria || '',
            subcategoria: rowData.subcategoria || '',
            precio: rowData.precio || '',
            stock: rowData.stock || '',
            stock_minimo: rowData.stock_minimo || '',
            peso: rowData.peso || '',
            dimensiones: rowData.dimensiones || '',
            imagen: rowData.imagen || '',
            // NUEVOS CAMPOS PARA CARACTERÍSTICAS Y APLICACIONES
            caracteristicas: rowData.caracteristicas || '',
            aplicaciones: rowData.aplicaciones || '',
            // NUEVOS CAMPOS PARA ACCESORIOS Y PRODUCTOS RELACIONADOS
            accesorios: rowData.accesorios || '',
            productos_relacionados: rowData.productos_relacionados || '',
            // NUEVOS CAMPOS TÉCNICOS
            sku_ec: rowData.sku_ec || '',
            potencia_kw: rowData.potencia_kw || '',
            voltaje: rowData.voltaje || '',
            frame_size: rowData.frame_size || ''
          };

          // Debug: Log de los datos normalizados
          console.log('Datos normalizados:', normalizedData);

          results.push(normalizedData);
        }
      }

      console.log('Total de filas procesadas:', results.length);
      console.log('Primeras 3 filas:', results.slice(0, 3));
      console.log('Nombres de columnas detectados:', Object.keys(results[0] || {}));

      console.log('=== RESUMEN DE PROCESAMIENTO ===');
      console.log('Total de filas en Excel:', worksheet.rowCount);
      console.log('Filas de headers:', 1);
      console.log('Filas de datos esperadas:', worksheet.rowCount - 1);
      console.log('Filas procesadas exitosamente:', results.length);
      console.log('Filas saltadas (sin SKU):', (worksheet.rowCount - 1) - results.length);
      console.log('Primeras 3 filas:', results.slice(0, 3));
      console.log('Nombres de columnas detectados:', Object.keys(results[0] || {}));
      console.log('=====================================');

      // Validar datos
      const validationErrors = ImportService.validateImportData(results);
      if (validationErrors.length > 0) {
        return res.json({
          success: false,
          error: 'Errores de validación en los datos',
          details: validationErrors
        });
      }

      // Importar datos
      const importResults = await ImportService.importSystemData(results);

      console.log('Importación completada:', importResults);

      res.json({
        success: true,
        message: 'Importación completada exitosamente',
        data: importResults
      });

    } catch (error) {
      console.error('Error procesando archivo Excel:', error);
      res.status(500).json({
        success: false,
        error: 'Error procesando archivo Excel',
        message: error.message
      });
    }

  } catch (error) {
    console.error('Error en importSystemData:', error);
    next(error);
  }
};

// Previsualizar datos del archivo
const previewImportData = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
    }

    console.log('Previsualizando archivo:', req.file.originalname);

    const results = [];
    const errors = [];

    // Obtener el buffer del archivo
    const fileBuffer = req.file.buffer;

    try {
      // Leer el archivo Excel con ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      
      // Obtener la primera hoja
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No se encontró ninguna hoja en el archivo Excel');
      }
      
      console.log('=== PREVIEW EXCEL ===');
      console.log('Nombre de la hoja:', worksheet.name);
      console.log('Total de filas en Excel:', worksheet.rowCount);
      console.log('Filas de datos esperadas:', worksheet.rowCount - 1); // -1 por la fila de headers
      console.log('============================');

      // Obtener headers de la primera fila
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value ? cell.value.toString().toLowerCase().trim() : '';
      });

      console.log('Headers detectados:', headers);

      // Procesar filas de datos (empezar desde la fila 2)
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData = {};
        
        // Mapear cada celda a su header correspondiente
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = processCellValue(cell);
          }
        });
        
        // Solo agregar filas que tengan SKU
        if (rowData.sku && rowData.sku.trim()) {
          console.log(`Procesando fila ${rowNumber}:`, rowData);
          
          // Normalizar los datos usando nombres de columnas
          const normalizedData = {
            sku: rowData.sku || '',
            nombre: rowData.nombre || '',
            descripcion: rowData.descripcion || '',
            marca: rowData.marca || '',
            categoria: rowData.categoria || '',
            subcategoria: rowData.subcategoria || '',
            precio: rowData.precio || '',
            stock: rowData.stock || '',
            stock_minimo: rowData.stock_minimo || '',
            peso: rowData.peso || '',
            dimensiones: rowData.dimensiones || '',
            imagen: rowData.imagen || '',
            // NUEVOS CAMPOS PARA CARACTERÍSTICAS Y APLICACIONES
            caracteristicas: rowData.caracteristicas || '',
            aplicaciones: rowData.aplicaciones || '',
            // NUEVOS CAMPOS PARA ACCESORIOS Y PRODUCTOS RELACIONADOS
            accesorios: rowData.accesorios || '',
            productos_relacionados: rowData.productos_relacionados || '',
            // NUEVOS CAMPOS TÉCNICOS
            sku_ec: rowData.sku_ec || '',
            potencia_kw: rowData.potencia_kw || '',
            voltaje: rowData.voltaje || '',
            frame_size: rowData.frame_size || ''
          };

          results.push(normalizedData);
        }
      }

      console.log('=== RESUMEN DE PREVISUALIZACIÓN ===');
      console.log('Total de filas en Excel:', worksheet.rowCount);
      console.log('Filas de headers:', 1);
      console.log('Filas de datos esperadas:', worksheet.rowCount - 1);
      console.log('Filas procesadas exitosamente:', results.length);
      console.log('Filas saltadas (sin SKU):', (worksheet.rowCount - 1) - results.length);
      console.log('Primeras 3 filas:', results.slice(0, 3));
      console.log('Nombres de columnas detectados:', Object.keys(results[0] || {}));
      console.log('========================================');

      // Validar datos para previsualización
      const validationErrors = ImportService.validateImportData(results);

      res.json({
        success: true,
        data: {
          preview: results, // Mostrar TODOS los productos
          total_rows: results.length,
          validation_errors: validationErrors,
          can_import: validationErrors.length === 0
        }
      });

    } catch (error) {
      console.error('Error previsualizando archivo Excel:', error);
      res.status(500).json({
        success: false,
        error: 'Error previsualizando archivo Excel',
        message: error.message
      });
    }

  } catch (error) {
    console.error('Error en previewImportData:', error);
    next(error);
  }
};

module.exports = {
  importSystemData: [upload.single('file'), importSystemData],
  previewImportData: [upload.single('file'), previewImportData]
};
