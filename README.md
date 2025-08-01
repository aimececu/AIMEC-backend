# AIMEC Backend - Sistema de Productos Industriales

Backend serverless para el sistema AIMEC con conexión a PostgreSQL. Sistema completo para gestión de productos industriales con especificaciones dinámicas, categorías, marcas y más.

## 🚀 Características

- ✅ **Gestión completa de productos** con especificaciones dinámicas
- ✅ **Sistema de categorías y subcategorías** jerárquico
- ✅ **Gestión de marcas y series** de productos
- ✅ **Especificaciones dinámicas** por tipo de producto
- ✅ **Búsqueda avanzada** con filtros múltiples
- ✅ **API RESTful** completamente documentada
- ✅ **Base de datos PostgreSQL** optimizada
- ✅ **Arquitectura modular** y escalable

## 📋 Configuración de la Base de Datos

### Opción 1: Base de Datos Local (Desarrollo)

#### 1. Instalar PostgreSQL

Asegúrate de tener PostgreSQL instalado en tu sistema:

- **Windows**: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`

#### 2. Crear la Base de Datos

```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear la base de datos
CREATE DATABASE aimec_db;

-- Verificar que se creó
\l
```

### Opción 2: Base de Datos en AWS RDS (Producción)

#### 1. Instalar AWS CLI

```bash
# Windows (usando chocolatey)
choco install awscli

# macOS
brew install awscli

# Ubuntu/Debian
sudo apt-get install awscli
```

#### 2. Configurar AWS CLI

```bash
# Configurar credenciales
aws configure

# Ingresa tu Access Key ID, Secret Access Key, región (ej: us-east-2) y formato de salida (json)
```

#### 3. Crear Instancia RDS PostgreSQL

```bash
# Crear grupo de subredes (si no existe)
aws rds create-db-subnet-group \
    --db-subnet-group-name aimec-subnet-group \
    --db-subnet-group-description "Subnet group for AIMEC database" \
    --subnet-ids subnet-12345678 subnet-87654321

# Crear grupo de seguridad
aws ec2 create-security-group \
    --group-name aimec-db-sg \
    --description "Security group for AIMEC database"

# Agregar regla para permitir tráfico PostgreSQL
aws ec2 authorize-security-group-ingress \
    --group-name aimec-db-sg \
    --protocol tcp \
    --port 5432 \
    --cidr 0.0.0.0/0

# Crear instancia RDS
aws rds create-db-instance \
    --db-instance-identifier aimec-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password TuPasswordSeguro123! \
    --allocated-storage 20 \
    --db-name aimec_db \
    --vpc-security-group-ids sg-12345678 \
    --db-subnet-group-name aimec-subnet-group \
    --backup-retention-period 7 \
    --storage-encrypted

# Verificar el estado de la instancia
aws rds describe-db-instances --db-instance-identifier aimec-db
```

#### 4. Obtener Endpoint de la Base de Datos

```bash
# Obtener el endpoint de la instancia
aws rds describe-db-instances \
    --db-instance-identifier aimec-db \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text
```

#### 5. Configurar Variables de Entorno para AWS

```env
# Configuración de la base de datos PostgreSQL en AWS RDS
DB_HOST=tu-instancia.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=postgres
DB_PASSWORD=TuPasswordSeguro123!

# Configuración para producción
NODE_ENV=production
AWS_REGION=us-east-2
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

#### Para Desarrollo Local:
```env
# Configuración de la base de datos PostgreSQL local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# Configuración para desarrollo local
NODE_ENV=development
```

#### Para Producción (AWS RDS):
```env
# Configuración de la base de datos PostgreSQL en AWS RDS
DB_HOST=tu-instancia.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=aimec_db
DB_USER=postgres
DB_PASSWORD=TuPasswordSeguro123!

# Configuración para producción
NODE_ENV=production
AWS_REGION=us-east-2
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar el Proyecto

#### Desarrollo Local
```bash
npm run dev
```

#### Con Serverless Framework
```bash
# Desplegar
serverless deploy

# Ejecutar localmente
serverless offline
```

## 🏗️ Estructura del Proyecto

```
AIMEC-backend/
├── config/
│   ├── database.js      # Configuración de base de datos
│   └── env.js           # Variables de entorno
├── controllers/
│   ├── products.js      # Controlador de productos
│   ├── categories.js    # Controlador de categorías/marcas
│   └── specifications.js # Controlador de especificaciones
├── database/
│   ├── queries/
│   │   ├── products.js      # Consultas de productos
│   │   ├── categories.js    # Consultas de categorías
│   │   ├── specifications.js # Consultas de especificaciones
│   │   └── index.js         # Índice de consultas
│   └── queries.js       # Consultas principales
├── routes/
│   ├── products.js      # Rutas de productos
│   ├── categories.js    # Rutas de categorías
│   └── specifications.js # Rutas de especificaciones
├── app.js              # Aplicación principal
├── handler.js          # Handler para serverless
└── serverless.yml      # Configuración serverless
```

## 📚 API Endpoints

### 🏠 Rutas Principales
- `GET /` - Información de la API
- `GET /health` - Estado de la aplicación y base de datos

### 📦 Productos (`/api/products`)
- `GET /` - Obtener todos los productos (con filtros)
- `GET /search` - Buscar productos
- `GET /featured` - Obtener productos destacados
- `GET /stats` - Estadísticas de productos
- `GET /filter/specification` - Filtrar por especificación
- `GET /category/:categoryId` - Productos por categoría
- `GET /brand/:brandId` - Productos por marca
- `GET /:id` - Obtener producto por ID
- `GET /slug/:slug` - Obtener producto por slug
- `POST /` - Crear nuevo producto
- `PUT /:id` - Actualizar producto
- `DELETE /:id` - Eliminar producto

### 📂 Categorías (`/api/categories`)
- `GET /` - Obtener todas las categorías
- `GET /:id` - Obtener categoría por ID
- `POST /` - Crear nueva categoría
- `PUT /:id` - Actualizar categoría
- `DELETE /:id` - Eliminar categoría

#### Subcategorías
- `GET /:categoryId/subcategories` - Subcategorías por categoría
- `GET /subcategories/:id` - Obtener subcategoría
- `POST /subcategories` - Crear subcategoría
- `PUT /subcategories/:id` - Actualizar subcategoría
- `DELETE /subcategories/:id` - Eliminar subcategoría

#### Marcas
- `GET /brands` - Obtener todas las marcas
- `GET /brands/:id` - Obtener marca por ID
- `POST /brands` - Crear nueva marca
- `PUT /brands/:id` - Actualizar marca
- `DELETE /brands/:id` - Eliminar marca

#### Series de Productos
- `GET /series` - Obtener series de productos
- `GET /series/:id` - Obtener serie por ID
- `POST /series` - Crear nueva serie
- `PUT /series/:id` - Actualizar serie
- `DELETE /series/:id` - Eliminar serie

### ⚙️ Especificaciones (`/api/specifications`)
- `GET /types` - Obtener tipos de especificaciones
- `GET /types/:id` - Obtener tipo por ID
- `POST /types` - Crear tipo de especificación
- `PUT /types/:id` - Actualizar tipo
- `DELETE /types/:id` - Eliminar tipo

#### Especificaciones de Productos
- `GET /products/:productId` - Especificaciones de un producto
- `GET /products/:productId/complete` - Especificaciones completas
- `GET /:id` - Obtener especificación específica
- `POST /products` - Crear especificación
- `POST /products/multiple` - Crear múltiples especificaciones
- `PUT /:id` - Actualizar especificación
- `DELETE /:id` - Eliminar especificación

#### Consultas Especializadas
- `GET /category/:categoryId` - Especificaciones por categoría
- `GET /filter/products` - Filtrar productos por especificación

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- **`products`** - Productos principales
- **`categories`** - Categorías principales
- **`subcategories`** - Subcategorías
- **`brands`** - Marcas
- **`product_series`** - Series de productos
- **`specification_types`** - Tipos de especificaciones
- **`product_specifications`** - Valores de especificaciones

### Ejemplo de Producto Completo
```json
{
  "id": 1,
  "sku": "PLC-SIEMENS-1200",
  "name": "PLC Siemens S7-1200",
  "description": "Controlador lógico programable",
  "short_description": "PLC compacto para automatización",
  "brand_name": "Siemens",
  "category_name": "Controladores",
  "subcategory_name": "PLC",
  "series_name": "S7-1200",
  "price": 2500.00,
  "original_price": 2800.00,
  "stock_quantity": 15,
  "is_featured": true,
  "specifications": [
    {
      "spec_name": "cpu",
      "spec_display_name": "CPU",
      "data_type": "text",
      "display_value": "Intel Atom"
    },
    {
      "spec_name": "memory",
      "spec_display_name": "Memoria",
      "data_type": "text",
      "display_value": "100KB"
    }
  ]
}
```

## 🔍 Filtros y Búsqueda

### Filtros de Productos
- `category_id` - Filtrar por categoría
- `brand_id` - Filtrar por marca
- `subcategory_id` - Filtrar por subcategoría
- `min_price` / `max_price` - Rango de precios
- `featured` - Solo productos destacados
- `in_stock` - Solo productos en stock
- `limit` / `offset` - Paginación

### Búsqueda Avanzada
- Búsqueda por texto en nombre y descripción
- Búsqueda por SKU
- Filtros combinados con búsqueda
- Ordenamiento por relevancia

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Ejecutar en desarrollo
npm run deploy       # Desplegar a producción
npm run deploy:prod  # Desplegar a producción
npm run remove       # Remover despliegue
npm run logs         # Ver logs
```

## 🔧 Solución de Problemas

### Error de Conexión a la Base de Datos

#### Para Base de Datos Local:
1. Verifica que PostgreSQL esté ejecutándose
2. Confirma las credenciales en el archivo `.env`
3. Asegúrate de que la base de datos `aimec_db` exista

#### Para Base de Datos AWS RDS:
1. Verifica que la instancia RDS esté en estado "Available"
2. Confirma que el grupo de seguridad permita conexiones desde tu IP
3. Verifica las credenciales y el endpoint en el archivo `.env`
4. Asegúrate de que la instancia esté en la misma VPC que tu aplicación

```bash
# Verificar estado de la instancia RDS
aws rds describe-db-instances --db-instance-identifier aimec-db

# Verificar grupos de seguridad
aws ec2 describe-security-groups --group-names aimec-db-sg
```

### Error de Permisos
```sql
-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE aimec_db TO postgres;
```

### Verificar Conexión

#### Para Base de Datos Local:
```bash
# Probar conexión desde línea de comandos
psql -h localhost -U postgres -d aimec_db
```

#### Para Base de Datos AWS RDS:
```bash
# Probar conexión desde línea de comandos
psql -h tu-instancia.region.rds.amazonaws.com -U postgres -d aimec_db

# O usando el endpoint completo
psql "postgresql://postgres:TuPasswordSeguro123!@tu-instancia.region.rds.amazonaws.com:5432/aimec_db"
```

### Logs de la Aplicación
```bash
# Ver logs en tiempo real
npm run logs

# Ver logs específicos
serverless logs -f api --tail
```

## 📝 Notas de Desarrollo

- La aplicación se inicializa automáticamente al primer request
- Las especificaciones son dinámicas y se pueden configurar por categoría
- Todos los endpoints devuelven respuestas consistentes con `success` y `data`
- La base de datos incluye datos de ejemplo para testing
- El sistema soporta soft delete (no elimina registros físicamente)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request 