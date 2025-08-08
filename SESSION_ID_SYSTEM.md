# Sistema de Autenticación Basado en Session ID

## Descripción General

Este sistema implementa un esquema de autenticación simplificado y seguro basado únicamente en Session ID:

- **Session ID**: Identificador único de sesión (32 caracteres hexadecimales)
- **Tokens Internos**: Access token y refresh token manejados internamente por el backend
- **Renovación Automática**: Transparente para el frontend
- **Sin Bearer Tokens**: El frontend no maneja tokens JWT

## Arquitectura del Sistema

### 1. Componentes

#### Session ID
- **Formato**: 32 caracteres hexadecimales (generado con crypto.randomBytes)
- **Propósito**: Identificador único de sesión para el frontend
- **Almacenamiento**: localStorage (frontend) + cookies httpOnly
- **Duración**: 30 días (misma que el refresh token)

#### Access Token (Interno)
- **Duración**: 30 minutos
- **Propósito**: Autenticar peticiones internas del backend
- **Almacenamiento**: Base de datos (campo `access_token`)
- **Renovación**: Automática cuando expira

#### Refresh Token (Interno)
- **Duración**: 30 días
- **Propósito**: Renovar access tokens expirados
- **Almacenamiento**: Base de datos (campo `token`)
- **Seguridad**: Firmado con clave secreta diferente

### 2. Flujo de Autenticación

#### Login
1. Usuario envía credenciales
2. Servidor valida credenciales
3. Se crea sesión en base de datos con:
   - Session ID único
   - Access token (30 min)
   - Refresh token (30 días)
4. Se envía solo el Session ID al frontend
5. Frontend almacena Session ID en localStorage y cookies

#### Verificación de Peticiones
1. Frontend envía Session ID en header `X-Session-ID`
2. Backend busca sesión en base de datos
3. Si Session ID válido:
   - Verifica access token interno
   - Si expirado, renueva automáticamente usando refresh token
   - Procesa la petición
4. Si Session ID inválido o expirado:
   - Devuelve 401
   - Frontend redirige a login

#### Renovación Automática
1. Backend detecta access token expirado
2. Usa refresh token almacenado en base de datos
3. Genera nuevo access token
4. Actualiza access token en base de datos
5. Continúa procesando la petición
6. Frontend no se entera del proceso

## Implementación Backend

### SessionService

```javascript
// Crear sesión (retorna solo sessionId)
createSession(userId, ipAddress, userAgent)

// Verificar sesión por sessionId (incluye renovación automática)
verifySession(sessionId)

// Renovar access token internamente
renewAccessToken(sessionId)

// Desactivar sesión
deactivateSession(sessionId)
```

### Middleware de Verificación

```javascript
// verifySession middleware
- Extrae sessionId de headers o cookies
- Llama a SessionService.verifySession()
- Incluye renovación automática transparente
- Agrega usuario y sesión a req
```

### Rutas de Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify` - Verificar autenticación
- `POST /api/auth/renew-session` - Renovar sesión manualmente
- `GET /api/auth/sessions` - Obtener sesiones del usuario
- `POST /api/auth/logout-all` - Cerrar todas las sesiones

## Implementación Frontend

### AuthService

```javascript
// Interceptores de Axios
- Agrega sessionId automáticamente a todas las peticiones
- Maneja errores 401 redirigiendo a login
- Sin lógica de renovación de tokens
```

### Almacenamiento

```javascript
// localStorage
- sessionId: ID único de sesión
- user: Datos del usuario

// Cookies (httpOnly)
- sessionId: Para peticiones automáticas
```

## Ventajas del Sistema

### Seguridad
- **Tokens ocultos**: Access y refresh tokens nunca salen del backend
- **Session ID único**: Difícil de adivinar o interceptar
- **Renovación automática**: Transparente y segura
- **Múltiples sesiones**: Usuario puede tener sesiones en varios dispositivos

### Simplicidad
- **Frontend simple**: Solo maneja sessionId
- **Sin Bearer tokens**: No hay que manejar Authorization headers
- **Renovación transparente**: El usuario no nota interrupciones
- **Menos código**: Menos complejidad en el frontend

### Experiencia de Usuario
- **Sin interrupciones**: Renovación automática transparente
- **Persistencia**: Sesión activa por 30 días
- **Múltiples dispositivos**: Sesiones independientes
- **Control de sesiones**: Usuario puede ver y cerrar sesiones

## Configuración

### Variables de Entorno

```bash
# Backend
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
BCRYPT_SALT_ROUNDS=12

# Frontend
REACT_APP_API_URL=http://169.254.31.130:3750/api
```

### Base de Datos

La tabla `sessions` almacena:
- `user_id`: ID del usuario
- `session_id`: ID único de sesión (32 caracteres)
- `token`: Refresh token (JWT interno)
- `access_token`: Access token actual (JWT interno)
- `ip_address`: IP del cliente
- `user_agent`: User agent del navegador
- `is_active`: Estado de la sesión
- `expires_at`: Fecha de expiración

## Uso

### Backend

```javascript
// Verificar autenticación en rutas
router.get('/protected', verifySession, (req, res) => {
  // req.user contiene datos del usuario
  // req.session contiene datos de la sesión
});

// Verificar rol de admin
router.post('/admin', verifySession, requireAdmin, (req, res) => {
  // Solo usuarios admin pueden acceder
});
```

### Frontend

```javascript
// Login
const result = await authService.login(email, password);
if (result.success) {
  // Usuario autenticado, sessionId guardado automáticamente
}

// Verificar autenticación
const auth = await authService.verifyAuth();
if (auth.success) {
  // Usuario autenticado
}

// Logout
await authService.logout();

// Renovar sesión manualmente (opcional)
await authService.renewSession();
```

## Pruebas

Ejecutar el script de prueba:

```bash
node test-session-id-system.js
```

Este script verifica:
- Creación de sesiones con sessionId
- Verificación de sesiones
- Renovación automática de tokens internos
- Gestión de múltiples sesiones
- Limpieza de sesiones expiradas

## Migración desde Sistema Anterior

El sistema mantiene compatibilidad:
- Funciones de renovación de sesión existentes
- Migración gradual sin interrupciones
- Soporte para sessionId existentes

## Seguridad

### Mejores Prácticas
- Usar HTTPS en producción
- Configurar cookies seguras
- Rotar claves secretas periódicamente
- Monitorear intentos de acceso fallidos
- Implementar rate limiting

### Consideraciones
- Los refresh tokens se invalidan al cambiar contraseña
- Sesiones se pueden cerrar individualmente
- Limpieza automática de sesiones expiradas
- Logs de actividad de sesiones
- Session ID de 32 caracteres es prácticamente imposible de adivinar

## Comparación con Sistemas Anteriores

| Aspecto | Sistema Anterior | Nuevo Sistema |
|---------|------------------|---------------|
| Frontend | Maneja tokens JWT | Solo sessionId |
| Seguridad | Tokens en frontend | Tokens ocultos |
| Complejidad | Alta | Baja |
| Renovación | Manual/automática | Automática transparente |
| Headers | Authorization: Bearer | X-Session-ID |
| Almacenamiento | localStorage + cookies | localStorage + cookies |
| Duración | Configurable | 30 días fijo |
