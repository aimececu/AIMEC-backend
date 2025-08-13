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
    fileSize: 5 * 1024 * 1024 // 5MB máximo
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
    const stream = Readable.from(fileBuffer);

    // Procesar archivo CSV
    stream
      .pipe(csv())
      .on('data', (data) => {
        // Normalizar los datos (convertir nombres de columnas)
        const normalizedData = {
          sku: data.sku || data.SKU,
          nombre: data.nombre || data.Nombre || data.name || data.Name,
          descripcion: data.descripcion || data.Descripcion || data.description || data.Description,
          marca: data.marca || data.Marca || data.brand || data.Brand,
          categoria: data.categoria || data.Categoria || data.category || data.Category,
          subcategoria: data.subcategoria || data.Subcategoria || data.subcategory || data.Subcategory,
          precio: data.precio || data.Precio || data.price || data.Price,
          stock: data.stock || data.Stock,
          stock_minimo: data.stock_minimo || data['stock_minimo'] || data['Stock Minimo'] || data['stock_minimo'],
          peso: data.peso || data.Peso || data.weight || data.Weight,
          dimensiones: data.dimensiones || data.Dimensiones || data.dimensions || data.Dimensions,
          imagen: data.imagen || data.Imagen || data.image || data.Image,
          // NUEVOS CAMPOS PARA CARACTERÍSTICAS Y APLICACIONES
          caracteristicas: data.caracteristicas || data.Caracteristicas || data.features || data.Features || data.caracteristicas || data.Caracteristicas,
          aplicaciones: data.aplicaciones || data.Aplicaciones || data.applications || data.Applications || data.aplicaciones || data.Aplicaciones
        };

        results.push(normalizedData);
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
      .pipe(csv())
      .on('data', (data) => {
        // Normalizar los datos
        const normalizedData = {
          sku: data.sku || data.SKU,
          nombre: data.nombre || data.Nombre || data.name || data.Name,
          descripcion: data.descripcion || data.Descripcion || data.description || data.Description,
          marca: data.marca || data.Marca || data.brand || data.Brand,
          categoria: data.categoria || data.Categoria || data.category || data.Category,
          subcategoria: data.subcategoria || data.Subcategoria || data.subcategory || data.Subcategory,
          precio: data.precio || data.Precio || data.price || data.Price,
          stock: data.stock || data.Stock,
          stock_minimo: data.stock_minimo || data['stock_minimo'] || data['Stock Minimo'] || data['stock_minimo'],
          peso: data.peso || data.Peso || data.weight || data.Weight,
          dimensiones: data.dimensiones || data.Dimensiones || data.dimensions || data.Dimensions,
          imagen: data.imagen || data.Imagen || data.image || data.Image,
          // NUEVOS CAMPOS PARA CARACTERÍSTICAS Y APLICACIONES
          caracteristicas: data.caracteristicas || data.Caracteristicas || data.features || data.Features || data.caracteristicas || data.Caracteristicas,
          aplicaciones: data.aplicaciones || data.Aplicaciones || data.applications || data.Applications || data.aplicaciones || data.Aplicaciones
        };

        results.push(normalizedData);
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
