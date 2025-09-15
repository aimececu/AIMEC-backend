# Configuración de SMTP2GO para AIMEC

## ¿Qué es SMTP2GO?

SMTP2GO es un servicio de email transaccional que ofrece mayor confiabilidad y mejores tasas de entrega que el SMTP tradicional. Es ideal para aplicaciones que necesitan enviar emails de forma confiable.

## Ventajas de SMTP2GO

- ✅ **Mayor confiabilidad**: Mejor tasa de entrega que SMTP tradicional
- ✅ **Analytics**: Tracking de emails enviados, entregados, abiertos, etc.
- ✅ **Fácil configuración**: Solo necesitas una API Key
- ✅ **Plan gratuito**: 1000 emails por mes
- ✅ **Sin configuración SMTP compleja**: No necesitas configurar puertos, SSL, etc.

## Configuración Paso a Paso

### 1. Crear cuenta en SMTP2GO

1. Ve a [https://www.smtp2go.com/](https://www.smtp2go.com/)
2. Regístrate con tu email
3. Verifica tu cuenta

### 2. Obtener API Key

1. Inicia sesión en tu dashboard de SMTP2GO
2. Ve a "API Keys" en el menú
3. Crea una nueva API Key
4. Copia la API Key generada

### 3. Configurar dominio de envío

1. En el dashboard, ve a "Sending Domains"
2. Agrega tu dominio (ej: `tudominio.com`)
3. Configura los registros DNS según las instrucciones
4. Verifica el dominio

### 4. Configurar variables de entorno

Crea o actualiza tu archivo `.env` con las siguientes variables:

```env
# SMTP2GO Configuration
SMTP2GO_API_KEY=tu_api_key_aqui
SMTP2GO_FROM_EMAIL=noreply@tudominio.com
SMTP2GO_FROM_NAME=AIMEC
CONTACT_EMAIL=contacto@tudominio.com
```

### 5. Probar la configuración

Puedes probar la configuración usando el endpoint de prueba:

```bash
# Probar conexión
curl -X POST http://localhost:3750/api/email/test-connection

# Enviar email de prueba
curl -X POST http://localhost:3750/api/email/test
```

## Endpoints de Email

### Enviar mensaje de contacto
```
POST /api/email/contact
```

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "phone": "+1234567890",
  "company": "Empresa ABC",
  "message": "Hola, me interesa conocer más sobre sus productos."
}
```

### Enviar cotización
```
POST /api/email/quotation
```

**Body:**
```json
{
  "customerInfo": {
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+1234567890",
    "company": "Empresa ABC"
  },
  "items": [
    {
      "productName": "Motor Siemens 1HP",
      "quantity": 2,
      "price": 150.00,
      "total": 300.00
    }
  ],
  "total": 300.00,
  "notes": "Entrega en 5 días hábiles"
}
```

### Verificar estado del servicio
```
GET /api/email/status
```

## Migración desde SMTP tradicional

Si ya tenías configurado SMTP tradicional, la migración es automática:

1. **Mantén las variables SMTP existentes** (para compatibilidad)
2. **Agrega las nuevas variables SMTP2GO**
3. **El sistema usará SMTP2GO automáticamente** si está configurado

## Troubleshooting

### Error: "SMTP2GO_API_KEY no está configurado"
- Verifica que la variable `SMTP2GO_API_KEY` esté en tu archivo `.env`
- Reinicia el servidor después de agregar la variable

### Error: "SMTP2GO_FROM_EMAIL no está configurado"
- Verifica que la variable `SMTP2GO_FROM_EMAIL` esté en tu archivo `.env`
- Asegúrate de que el email esté verificado en SMTP2GO

### Error: "Error de conexión: No se puede conectar a la API de SMTP2GO"
- Verifica tu conexión a internet
- Verifica que la API Key sea correcta
- Verifica que tu cuenta de SMTP2GO esté activa

### Error: "Error SMTP2GO: [mensaje]"
- Revisa el mensaje de error específico
- Verifica que el dominio de envío esté configurado correctamente
- Verifica que no hayas excedido el límite de emails

## Límites y Precios

### Plan Gratuito
- 1000 emails por mes
- 100 emails por día
- Soporte por email

### Planes Pagos
- Desde $10/mes para 10,000 emails
- Mejores tasas de entrega
- Soporte prioritario
- Analytics avanzados

## Monitoreo y Analytics

SMTP2GO proporciona analytics detallados:

- Emails enviados
- Emails entregados
- Emails abiertos
- Clicks en enlaces
- Bounces y spam reports

Accede a estos datos desde tu dashboard de SMTP2GO.

## Soporte

- **Documentación**: [https://www.smtp2go.com/docs/](https://www.smtp2go.com/docs/)
- **Soporte**: Desde el dashboard de SMTP2GO
- **Status**: [https://status.smtp2go.com/](https://status.smtp2go.com/)
