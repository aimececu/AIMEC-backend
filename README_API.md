# API de Sistema de Productos AIMEC

## 📚 Documentación de la API

Esta API proporciona endpoints para gestionar productos, categorías y especificaciones del sistema AIMEC.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Ejecutar en desarrollo

**Opción 1: Serverless Framework (recomendado para producción)**
```bash
npm run dev
```

**Opción 2: Express directo (recomendado para desarrollo)**
```bash
npm run dev:express
```

### Ejecutar en producción

```bash
npm run deploy
```

## 📖 Documentación Interactiva

### Swagger UI

La documentación interactiva de la API está disponible en:

- **Desarrollo (localhost)**: `http://localhost:3750/api-docs`
- **Producción**: `https://tu-dominio.com/api-docs`

### Características de la Documentación

- ✅ **Interfaz interactiva**: Prueba los endpoints directamente desde el navegador
- ✅ **Esquemas completos**: Documentación detallada de todos los modelos de datos
- ✅ **Ejemplos de respuestas**: Casos de éxito y error documentados
- ✅ **Filtros y búsqueda**: Encuentra rápidamente el endpoint que necesitas
- ✅ **Autenticación**: Preparado para futuras implementaciones de JWT

## 🔗 Endpoints Principales

### Sistema
- `GET /` - Información de la API
- `GET /health` - Estado del sistema y base de datos

### Productos
- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/search` - Buscar productos
- `GET /api/products/featured` - Productos destacados
- `GET /api/products/stats` - Estadísticas de productos
- `GET /api/products/{id}` - Obtener producto por ID
- `GET /api/products/slug/{slug}` - Obtener producto por slug
- `POST /api/products` - Crear producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/{id}` - Obtener categoría por ID
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/{id}` - Actualizar categoría
- `DELETE /api/categories/{id}` - Eliminar categoría

### Especificaciones
- `GET /api/specifications/types` - Tipos de especificaciones
- `GET /api/specifications/products/{productId}` - Especificaciones de un producto
- `POST /api/specifications/products` - Crear especificación
- `PUT /api/specifications/{id}` - Actualizar especificación
- `DELETE /api/specifications/{id}` - Eliminar especificación

## 📊 Modelos de Datos

### Producto
```json
{
  "id": 1,
  "name": "Nombre del producto",
  "slug": "nombre-del-producto",
  "description": "Descripción del producto",
  "price": 99.99,
  "category_id": 1,
  "brand_id": 1,
  "series_id": 1,
  "image_url": "https://ejemplo.com/imagen.jpg",
  "is_featured": true,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Categoría
```json
{
  "id": 1,
  "name": "Nombre de la categoría",
  "description": "Descripción de la categoría",
  "parent_id": null,
  "is_active": true
}
```

### Especificación
```json
{
  "id": 1,
  "product_id": 1,
  "name": "Potencia",
  "value": "1000W",
  "unit": "W"
}
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# Servidor
PORT=3000
NODE_ENV=development
```

### Base de Datos

La API utiliza PostgreSQL. Asegúrate de tener la base de datos configurada según el esquema en `database_schema.sql`.

## 🧪 Pruebas

### Usando Swagger UI

1. Abre `http://localhost:3000/api-docs`
2. Selecciona el endpoint que quieres probar
3. Haz clic en "Try it out"
4. Completa los parámetros requeridos
5. Haz clic en "Execute"

### Usando cURL

```bash
# Obtener todos los productos
curl -X GET "http://localhost:3000/api/products"

# Crear un producto
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto de prueba",
    "description": "Descripción del producto",
    "price": 99.99,
    "category_id": 1
  }'
```

## 📝 Respuestas de la API

### Formato de Respuesta Exitoso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Formato de Respuesta de Error
```json
{
  "success": false,
  "error": "Tipo de error",
  "message": "Descripción del error"
}
```

## 🚨 Códigos de Estado HTTP

- `200` - OK (Operación exitosa)
- `201` - Created (Recurso creado)
- `400` - Bad Request (Datos inválidos)
- `404` - Not Found (Recurso no encontrado)
- `500` - Internal Server Error (Error del servidor)

## 🔒 Seguridad

La API está preparada para implementar autenticación JWT. Los esquemas de seguridad están definidos en Swagger para futuras implementaciones.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre la API:

- 📧 Email: contacto@aimec.com
- 📱 Teléfono: +1234567890
- 🌐 Sitio web: https://aimec.com

---

**Desarrollado con ❤️ por el equipo AIMEC** 