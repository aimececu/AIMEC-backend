const ImportService = require('../services/ImportService');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

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

    // Procesar archivo CSV directamente desde el buffer
    const results = [];
    const errors = [];

    // Crear stream desde el buffer del archivo
    const fileBuffer = req.file.buffer;
    
    // Debug: Ver el contenido del archivo
    console.log('=== DEBUG ARCHIVO ===');
    console.log('Tamaño del archivo:', fileBuffer.length, 'bytes');
    console.log('Primeros 200 caracteres del archivo:', fileBuffer.toString('utf8').substring(0, 200));
    console.log('Tipo de archivo:', req.file.mimetype);
    console.log('Nombre del archivo:', req.file.originalname);
    console.log('========================');
    
    const stream = Readable.from(fileBuffer);

    // Procesar archivo CSV
    stream
      .pipe(csv({
        separator: ',', // Usar comas como separador (CSV estándar)
        headers: true,  // Primera fila contiene headers
        skipEmptyLines: true,
        strict: false,  // Ser más flexible con el formato
        skipLinesWithEmptyValues: false
      }))
      .on('data', (data) => {
        // Debug: Log de los datos recibidos
        console.log('=== DATOS CSV RECIBIDOS ===');
        console.log('Datos completos:', data);
        console.log('Claves disponibles:', Object.keys(data));
        console.log('===========================');
        
        // Detectar si es fila de headers por el contenido (si contiene palabras como 'sku', 'nombre', etc.)
        const isHeaderRow = Object.values(data).some(value => 
          typeof value === 'string' && 
          ['sku', 'nombre', 'descripcion', 'marca', 'categoria'].some(header => 
            value.toLowerCase().includes(header.toLowerCase())
          )
        );
        
        if (isHeaderRow) {
          console.log('Fila de headers detectada, saltando:', data);
          // NO agregar a results, pero continuar procesando
        } else {
          console.log('Procesando fila de datos:', data);
          
          // Normalizar los datos directamente desde las claves _0, _1, etc.
          const normalizedData = {
            sku: data._0 || '',
            nombre: data._1 || '',
            descripcion: data._2 || '',
            marca: data._3 || '',
            categoria: data._4 || '',
            subcategoria: data._5 || '',
            precio: data._6 || '',
            stock: data._7 || '',
            stock_minimo: data._8 || '',
            peso: data._9 || '',
            dimensiones: data._10 || '',
            imagen: data._11 || '',
            // NUEVOS CAMPOS PARA CARACTERÍSTICAS Y APLICACIONES
            caracteristicas: data._12 || '',
            aplicaciones: data._13 || '',
            // NUEVOS CAMPOS PARA ACCESORIOS Y PRODUCTOS RELACIONADOS
            accesorios: data._14 || '',
            productos_relacionados: data._15 || ''
          };

          // Debug: Log de los datos normalizados
          console.log('Datos normalizados:', normalizedData);

          results.push(normalizedData);
        }
      })
      .on('end', async () => {
        try {
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
          console.error('Error durante la importación:', error);
          res.status(500).json({
            success: false,
            error: 'Error durante la importación',
            message: error.message
          });
        }
      })
      .on('error', (error) => {
        console.error('Error procesando archivo:', error);
        res.status(500).json({
          success: false,
          error: 'Error procesando archivo',
          message: error.message
        });
      });

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

    // Crear stream desde el buffer del archivo
    const fileBuffer = req.file.buffer;
    const stream = Readable.from(fileBuffer);

    // Procesar archivo CSV para previsualización
    stream
      .pipe(csv({
        separator: ',', // Usar comas como separador (CSV estándar)
        headers: true,  // Primera fila contiene headers
        skipEmptyLines: true
      }))
      .on('data', (data) => {
        console.log('=== PREVIEW CSV RECIBIDOS ===');
        console.log('Datos completos:', data);
        console.log('Claves disponibles:', Object.keys(data));
        console.log('=============================');
        
        // Detectar si es fila de headers por el contenido (si contiene palabras como 'sku', 'nombre', etc.)
        const isHeaderRow = Object.values(data).some(value => 
          typeof value === 'string' && 
          ['sku', 'nombre', 'descripcion', 'marca', 'categoria'].some(header => 
            value.toLowerCase().includes(header.toLowerCase())
          )
        );
        
        if (isHeaderRow) {
          console.log('Fila de headers detectada, saltando:', data);
          // NO agregar a results, pero continuar procesando
        } else {
          console.log('Procesando fila de datos:', data);
          
          // Normalizar los datos directamente desde las claves _0, _1, etc.
          const normalizedData = {
            sku: data._0 || '',
            nombre: data._1 || '',
            descripcion: data._2 || '',
            marca: data._3 || '',
            categoria: data._4 || '',
            subcategoria: data._5 || '',
            precio: data._6 || '',
            stock: data._7 || '',
            stock_minimo: data._8 || '',
            peso: data._9 || '',
            dimensiones: data._10 || '',
            imagen: data._11 || '',
            // NUEVOS CAMPOS PARA CARACTERÍSTICAS Y APLICACIONES
            caracteristicas: data._12 || '',
            aplicaciones: data._13 || '',
            // NUEVOS CAMPOS PARA ACCESORIOS Y PRODUCTOS RELACIONADOS
            accesorios: data._14 || '',
            productos_relacionados: data._15 || ''
          };

          results.push(normalizedData);
        }
      })
      .on('end', () => {
        // Validar datos para previsualización
        const validationErrors = ImportService.validateImportData(results);

        res.json({
          success: true,
          data: {
            preview: results.slice(0, 10), // Solo las primeras 10 filas
            total_rows: results.length,
            validation_errors: validationErrors,
            can_import: validationErrors.length === 0
          }
        });
      })
      .on('error', (error) => {
        console.error('Error previsualizando archivo:', error);
        res.status(500).json({
          success: false,
          error: 'Error previsualizando archivo',
          message: error.message
        });
      });

  } catch (error) {
    console.error('Error en previewImportData:', error);
    next(error);
  }
};

module.exports = {
  importSystemData: [upload.single('file'), importSystemData],
  previewImportData: [upload.single('file'), previewImportData]
};
