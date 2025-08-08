# Sistema de Tokens Dual con Renovación Automática

## Descripción General

Este sistema implementa un esquema de autenticación basado en tokens duales que proporciona mayor seguridad y mejor experiencia de usuario:

- **Access Token**: Token de corta duración (30 minutos) para operaciones diarias
- **Refresh Token**: Token de larga duración (30 días) para renovar automáticamente el access token

## Arquitectura del Sistema

### 1. Tokens

#### Access Token
- **Duración**: 30 minutos
- **Propósito**: Autenticar peticiones a la API
- **Almacenamiento**: localStorage (frontend) + cookies httpOnly
- **Renovación**: Automática cuando expira

#### Refresh Token
- **Duración**: 30 días
- **Propósito**: Renovar access tokens expirados
- **Almacenamiento**: Base de datos + localStorage + cookies httpOnly
- **Seguridad**: Firmado con clave secreta diferente

### 2. Flujo de Autenticación

#### Login
1. Usuario envía credenciales
2. Servidor valida credenciales
3. Se crea sesión en base de datos
4. Se generan access token y refresh token
5. Se envían ambos tokens al cliente
6. Cliente almacena tokens en localStorage y cookies

#### Verificación de Peticiones
1. Cliente envía access token en header `Authorization: Bearer <token>`
2. Servidor verifica access token
3. Si válido: petición procesada
4. Si expirado: servidor intenta renovar automáticamente usando refresh token
5. Si renovación exitosa: se envían nuevos tokens en headers de respuesta
6. Si renovación falla: se devuelve 401 y cliente redirige a login

#### Renovación Automática
1. Servidor detecta access token expirado
2. Extrae refresh token de headers o cookies
3. Verifica refresh token en base de datos
4. Genera nuevo access token
5. Envía nuevos tokens en headers de respuesta
6. Cliente actualiza tokens automáticamente

## Implementación Backend

### SessionService

```javascript
// Generar access token (30 minutos)
generateAccessToken(userId, sessionId)

// Generar refresh token (30 días)
generateRefreshToken(userId, sessionId)

// Verificar access token
verifyAccessToken(accessToken)

// Verificar refresh token
verifyRefreshToken(refreshToken)

// Renovar access token
renewAccessToken(refreshToken)
```

### Middleware de Verificación

```javascript
// verifySession middleware
- Verifica access token primero
- Si expirado, intenta renovar con refresh token
- Si renovación exitosa, actualiza cookies automáticamente
- Si falla, devuelve 401
```

### Rutas de Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify` - Verificar autenticación
- `POST /api/auth/renew-access-token` - Renovar access token manualmente
- `POST /api/auth/renew-session` - Renovar sesión (compatibilidad)
- `GET /api/auth/sessions` - Obtener sesiones del usuario
- `POST /api/auth/logout-all` - Cerrar todas las sesiones

## Implementación Frontend

### AuthService

```javascript
// Interceptores de Axios
- Agrega tokens automáticamente a todas las peticiones
- Detecta renovación automática en respuestas
- Maneja errores 401 con renovación automática
- Redirige a login si renovación falla
```

### Almacenamiento de Tokens

```javascript
// localStorage
- accessToken: Token de acceso actual
- refreshToken: Token de renovación
- sessionId: ID de sesión (compatibilidad)
- user: Datos del usuario

// Cookies (httpOnly)
- accessToken: Para peticiones automáticas
- refreshToken: Para renovación automática
- sessionId: Para compatibilidad
```

## Ventajas del Sistema

### Seguridad
- **Access tokens de corta duración**: Minimiza riesgo de interceptación
- **Refresh tokens seguros**: Almacenados en base de datos con expiración
- **Renovación automática**: Transparente para el usuario
- **Múltiples sesiones**: Usuario puede tener sesiones en varios dispositivos

### Experiencia de Usuario
- **Sin interrupciones**: Renovación automática transparente
- **Persistencia**: Sesión activa por 30 días
- **Múltiples dispositivos**: Sesiones independientes
- **Control de sesiones**: Usuario puede ver y cerrar sesiones

### Escalabilidad
- **Base de datos**: Sesiones persistentes en servidor
- **Limpieza automática**: Sesiones expiradas se limpian automáticamente
- **Múltiples servidores**: Tokens JWT permiten escalabilidad horizontal

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
- `session_id`: ID único de sesión
- `token`: Refresh token (JWT)
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
  // Usuario autenticado
}

// Verificar autenticación
const auth = await authService.verifyAuth();
if (auth.success) {
  // Usuario autenticado
}

// Logout
await authService.logout();

// Renovar token manualmente
await authService.renewAccessToken();
```

## Pruebas

Ejecutar el script de prueba:

```bash
node test-dual-token-system.js
```

Este script verifica:
- Creación de sesiones con tokens dual
- Verificación de access y refresh tokens
- Renovación automática de tokens
- Gestión de múltiples sesiones
- Limpieza de sesiones expiradas

## Migración desde Sistema Anterior

El sistema mantiene compatibilidad con el sistema anterior:
- Soporta session ID para compatibilidad
- Funciones de renovación de sesión existentes
- Migración gradual sin interrupciones

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
