# 🚀 Guía de Migración - Sistema de Sincronización Automática

## 📋 Resumen

Hemos simplificado drásticamente el sistema de sincronización de la base de datos. Ahora **NO necesitas scripts adicionales** para mantener sincronizada la base de datos con tus modelos.

## ✅ Lo que cambió

### ❌ Antes (Complicado)
```bash
# Tenías que ejecutar múltiples scripts
npm run sync-db
npm run sync-new-models
npm run check-data
npm run create-admin
# ... y muchos más scripts
```

### ✅ Ahora (Simple)
```bash
# Solo ejecutar esto
npm run dev
```

## 🔄 Cómo funciona el nuevo sistema

### 1. **Detección Automática de Cambios**
- El sistema detecta automáticamente cuando modificas un modelo
- Usa un hash MD5 para comparar archivos de modelos
- Solo sincroniza cuando hay cambios reales

### 2. **Sincronización Inteligente**
- **`alter: true`**: Modifica tablas existentes sin borrar datos
- **Preserva datos**: No elimina información existente
- **Agrega columnas**: Nuevas columnas se agregan automáticamente

### 3. **Ejecución Automática**
- Se ejecuta al iniciar el servidor con `npm run dev`
- No necesitas hacer nada manual
- Logs claros te muestran qué está pasando

## 📝 Ejemplos Prácticos

### Agregar Nueva Columna
```javascript
// En models/Product.js
const Product = sequelize.define('Product', {
  // ... campos existentes ...
  
  // Nueva columna
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0
  }
});
```

**Resultado**: Al ejecutar `npm run dev`, la columna `rating` se agregará automáticamente a la tabla `products`.

### Agregar Nueva Tabla
```javascript
// Crear models/Review.js
const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT }
});

// En models/index.js
module.exports = {
  // ... otros modelos ...
  Review
};
```

**Resultado**: Al ejecutar `npm run dev`, la tabla `reviews` se creará automáticamente.

### Modificar Tipo de Dato
```javascript
// Cambiar de STRING a TEXT
description: {
  type: DataTypes.TEXT,  // Antes era STRING(255)
  allowNull: true
}
```

**Resultado**: Al ejecutar `npm run dev`, el tipo de columna se modificará automáticamente.

## 🚨 Casos Especiales

### Cuando necesitas forzar sincronización completa
```bash
npm run force-sync
```

**⚠️ ADVERTENCIA**: Esto elimina TODOS los datos de la base de datos.

**Cuándo usar**:
- Cambios estructurales complejos
- Problemas de sincronización
- Desarrollo inicial
- Reset completo de la base

### Cuando el sistema no detecta cambios
Si modificas un modelo pero el sistema no lo detecta:

1. **Verificar el archivo de hash**:
   ```bash
   cat .models-hash
   ```

2. **Eliminar el hash para forzar detección**:
   ```bash
   rm .models-hash
   npm run dev
   ```

## 📊 Logs del Sistema

### Logs Normales
```
✅ Conexión a la base de datos establecida correctamente
📁 Usando esquema: aimec_products
✅ Los modelos están sincronizados, no se requieren cambios
```

### Cuando hay cambios
```
✅ Conexión a la base de datos establecida correctamente
📁 Usando esquema: aimec_products
🔄 Detectados cambios en los modelos, sincronizando...
✅ Base de datos sincronizada inteligentemente
```

### Primera ejecución
```
✅ Conexión a la base de datos establecida correctamente
📁 Usando esquema: aimec_products
🔄 Detectados cambios en los modelos, sincronizando...
✅ Base de datos sincronizada inteligentemente
📝 Creando datos de ejemplo...
✅ Datos de ejemplo creados correctamente
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# Para desarrollo
NODE_ENV=development

# Para producción (desactiva logs de SQL)
NODE_ENV=production
```

### Archivos de Control
- **`.models-hash`**: Contiene el hash de los modelos (no tocar)
- **`.gitignore`**: Ya incluye `.models-hash` para no versionarlo

## 🐛 Solución de Problemas

### Error: "Cannot add column"
**Causa**: La columna ya existe o hay conflicto de tipos.

**Solución**:
1. Verificar que la columna no exista
2. Usar `npm run force-sync` si es necesario

### Error: "Table doesn't exist"
**Causa**: La tabla no se creó correctamente.

**Solución**:
1. Verificar que el modelo esté exportado en `models/index.js`
2. Ejecutar `npm run dev` nuevamente

### Error: "Foreign key constraint"
**Causa**: Problema con relaciones entre tablas.

**Solución**:
1. Verificar que las tablas relacionadas existan
2. Usar `npm run force-sync` para recrear todo

## 📚 Comandos Útiles

### Desarrollo Diario
```bash
# Iniciar servidor con sincronización automática
npm run dev

# Ver logs en tiempo real
npm run dev | grep -E "(✅|🔄|❌|📝)"
```

### Mantenimiento
```bash
# Forzar sincronización completa
npm run force-sync

# Verificar estado de la base
curl http://localhost:3750/health
```

### Debugging
```bash
# Ver hash actual de modelos
cat .models-hash

# Eliminar hash para forzar detección
rm .models-hash && npm run dev
```

## 🎯 Mejores Prácticas

### ✅ Hacer
- Modificar modelos directamente
- Ejecutar `npm run dev` después de cambios
- Revisar logs para confirmar sincronización
- Usar `force-sync` solo cuando sea necesario

### ❌ No hacer
- Ejecutar scripts manuales de sincronización
- Modificar `.models-hash` manualmente
- Usar `force-sync` en producción
- Ignorar logs de error

## 🔄 Migración desde el Sistema Anterior

### 1. Eliminar scripts antiguos
```bash
# Ya eliminamos la carpeta scripts/
# Ya limpiamos package.json
```

### 2. Verificar configuración
```bash
# Asegurar que .env esté configurado
cat .env

# Verificar que la base de datos exista
psql -U tu_usuario -d aimec_db -c "\dt"
```

### 3. Primera ejecución
```bash
npm run dev
```

El sistema detectará que es la primera vez y sincronizará todo automáticamente.

## 📞 Soporte

Si tienes problemas con el nuevo sistema:

1. **Revisar logs**: Los logs son muy descriptivos
2. **Verificar configuración**: Asegurar que `.env` esté correcto
3. **Usar force-sync**: Como último recurso
4. **Crear issue**: Con logs y descripción del problema

---

**¡El nuevo sistema es mucho más simple y eficiente!** 🚀 