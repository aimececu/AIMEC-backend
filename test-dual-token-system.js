const { User, Session } = require('./models');
const SessionService = require('./services/SessionService');

async function testDualTokenSystem() {
  console.log('🧪 Probando sistema de tokens dual...\n');

  try {
    // 1. Crear un usuario de prueba
    console.log('1. Creando usuario de prueba...');
    const testUser = await User.create({
      email: 'test-dual@aimec.com',
      password: 'test123',
      name: 'Usuario Test Dual',
      role: 'user',
      is_active: true
    });
    console.log('✅ Usuario creado:', testUser.email);

    // 2. Crear una sesión con tokens dual
    console.log('\n2. Creando sesión con tokens dual...');
    const sessionData = await SessionService.createSession(
      testUser.id,
      '192.168.1.100',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    console.log('✅ Sesión creada:');
    console.log('   Session ID:', sessionData.sessionId);
    console.log('   Access Token:', sessionData.accessToken.substring(0, 50) + '...');
    console.log('   Refresh Token:', sessionData.refreshToken.substring(0, 50) + '...');
    console.log('   Expira:', sessionData.expiresAt);

    // 3. Verificar access token
    console.log('\n3. Verificando access token...');
    const verifiedAccess = await SessionService.verifyAccessToken(sessionData.accessToken);
    if (verifiedAccess) {
      console.log('✅ Access token verificado correctamente');
      console.log('   Usuario:', verifiedAccess.user.name);
    } else {
      console.log('❌ Error: Access token no verificado');
    }

    // 4. Verificar refresh token
    console.log('\n4. Verificando refresh token...');
    const verifiedRefresh = await SessionService.verifyRefreshToken(sessionData.refreshToken);
    if (verifiedRefresh) {
      console.log('✅ Refresh token verificado correctamente');
      console.log('   Usuario:', verifiedRefresh.user.name);
    } else {
      console.log('❌ Error: Refresh token no verificado');
    }

    // 5. Renovar access token usando refresh token
    console.log('\n5. Renovando access token...');
    const renewedData = await SessionService.renewAccessToken(sessionData.refreshToken);
    console.log('✅ Access token renovado:');
    console.log('   Nuevo Access Token:', renewedData.accessToken.substring(0, 50) + '...');
    console.log('   Refresh Token (mismo):', renewedData.refreshToken.substring(0, 50) + '...');

    // 6. Verificar que el nuevo access token funciona
    console.log('\n6. Verificando nuevo access token...');
    const verifiedNewAccess = await SessionService.verifyAccessToken(renewedData.accessToken);
    if (verifiedNewAccess) {
      console.log('✅ Nuevo access token verificado correctamente');
    } else {
      console.log('❌ Error: Nuevo access token no verificado');
    }

    // 7. Verificar que el access token anterior ya no funciona
    console.log('\n7. Verificando que access token anterior ya no funciona...');
    const oldTokenStillValid = await SessionService.verifyAccessToken(sessionData.accessToken);
    if (!oldTokenStillValid) {
      console.log('✅ Access token anterior correctamente invalidado');
    } else {
      console.log('❌ Error: Access token anterior aún válido');
    }

    // 8. Probar renovación automática con verifyToken
    console.log('\n8. Probando renovación automática con verifyToken...');
    const autoRenewed = await SessionService.verifyToken(renewedData.refreshToken);
    if (autoRenewed && autoRenewed.accessToken) {
      console.log('✅ Renovación automática exitosa');
      console.log('   Nuevo Access Token:', autoRenewed.accessToken.substring(0, 50) + '...');
    } else {
      console.log('❌ Error: Renovación automática falló');
    }

    // 9. Crear múltiples sesiones
    console.log('\n9. Creando múltiples sesiones...');
    const session2 = await SessionService.createSession(
      testUser.id,
      '192.168.1.101',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    );
    const session3 = await SessionService.createSession(
      testUser.id,
      '192.168.1.102',
      'Mozilla/5.0 (Android 10; Mobile)'
    );
    console.log('✅ 3 sesiones creadas para el usuario');

    // 10. Obtener todas las sesiones del usuario
    console.log('\n10. Obteniendo todas las sesiones del usuario...');
    const userSessions = await SessionService.getUserSessions(testUser.id);
    console.log('✅ Sesiones del usuario:', userSessions.length);
    userSessions.forEach((session, index) => {
      console.log(`   Sesión ${index + 1}:`, {
        id: session.id,
        ip: session.ip_address,
        created: session.created_at,
        expires: session.expires_at
      });
    });

    // 11. Desactivar una sesión específica
    console.log('\n11. Desactivando una sesión específica...');
    await SessionService.deactivateSession(session2.sessionId);
    const deactivatedSession = await SessionService.verifySession(session2.sessionId);
    if (!deactivatedSession) {
      console.log('✅ Sesión desactivada correctamente');
    } else {
      console.log('❌ Error: Sesión no se desactivó');
    }

    // 12. Verificar que las otras sesiones siguen activas
    console.log('\n12. Verificando que otras sesiones siguen activas...');
    const activeSession1 = await SessionService.verifySession(sessionData.sessionId);
    const activeSession3 = await SessionService.verifySession(session3.sessionId);

    if (activeSession1 && activeSession3) {
      console.log('✅ Otras sesiones siguen activas');
    } else {
      console.log('❌ Error: Algunas sesiones se desactivaron incorrectamente');
    }

    // 13. Limpiar sesiones expiradas (no debería haber ninguna)
    console.log('\n13. Limpiando sesiones expiradas...');
    const cleanedCount = await SessionService.cleanupExpiredSessions();
    console.log('✅ Sesiones expiradas limpiadas:', cleanedCount);

    // 14. Desactivar todas las sesiones del usuario
    console.log('\n14. Desactivando todas las sesiones del usuario...');
    await SessionService.deactivateAllUserSessions(testUser.id);

    const remainingSessions = await SessionService.getUserSessions(testUser.id);
    if (remainingSessions.length === 0) {
      console.log('✅ Todas las sesiones desactivadas correctamente');
    } else {
      console.log('❌ Error: Algunas sesiones no se desactivaron');
    }

    // 15. Limpiar datos de prueba
    console.log('\n15. Limpiando datos de prueba...');
    await testUser.destroy();
    console.log('✅ Usuario de prueba eliminado');

    console.log('\n✅ Prueba del sistema de tokens dual completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testDualTokenSystem().catch(console.error);
