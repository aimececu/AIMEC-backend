const { User, Session } = require('./models');
const SessionService = require('./services/SessionService');

async function testSessionSystem() {
  console.log('🧪 Probando sistema de sesiones...\n');

  try {
    // 1. Crear un usuario de prueba
    console.log('1. Creando usuario de prueba...');
    const testUser = await User.create({
      email: 'test@aimec.com',
      password: 'test123',
      name: 'Usuario Test',
      role: 'user',
      is_active: true
    });
    console.log('✅ Usuario creado:', testUser.email);

    // 2. Crear una sesión
    console.log('\n2. Creando sesión...');
    const sessionData = await SessionService.createSession(
      testUser.id,
      '192.168.1.100',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    console.log('✅ Sesión creada:');
    console.log('   Session ID:', sessionData.sessionId);
    console.log('   Token:', sessionData.token.substring(0, 50) + '...');
    console.log('   Expira:', sessionData.expiresAt);

    // 3. Verificar sesión por session ID
    console.log('\n3. Verificando sesión por session ID...');
    const verifiedSession = await SessionService.verifySession(sessionData.sessionId);
    if (verifiedSession) {
      console.log('✅ Sesión verificada correctamente');
      console.log('   Usuario:', verifiedSession.user.name);
      console.log('   Email:', verifiedSession.user.email);
    } else {
      console.log('❌ Error: Sesión no verificada');
    }

    // 4. Verificar sesión por token
    console.log('\n4. Verificando sesión por token...');
    const verifiedByToken = await SessionService.verifyToken(sessionData.token);
    if (verifiedByToken) {
      console.log('✅ Token verificado correctamente');
      console.log('   Usuario:', verifiedByToken.user.name);
    } else {
      console.log('❌ Error: Token no verificado');
    }

    // 5. Renovar sesión
    console.log('\n5. Renovando sesión...');
    const renewedSession = await SessionService.renewSession(sessionData.sessionId);
    console.log('✅ Sesión renovada:');
    console.log('   Nuevo token:', renewedSession.token.substring(0, 50) + '...');
    console.log('   Nueva expiración:', renewedSession.expiresAt);

    // 6. Verificar sesión renovada
    console.log('\n6. Verificando sesión renovada...');
    const verifiedRenewed = await SessionService.verifyToken(renewedSession.token);
    if (verifiedRenewed) {
      console.log('✅ Sesión renovada verificada correctamente');
    } else {
      console.log('❌ Error: Sesión renovada no verificada');
    }

    // 7. Crear múltiples sesiones
    console.log('\n7. Creando múltiples sesiones...');
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

    // 8. Obtener todas las sesiones del usuario
    console.log('\n8. Obteniendo todas las sesiones del usuario...');
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

    // 9. Desactivar una sesión específica
    console.log('\n9. Desactivando una sesión específica...');
    await SessionService.deactivateSession(session2.sessionId);
    const deactivatedSession = await SessionService.verifySession(session2.sessionId);
    if (!deactivatedSession) {
      console.log('✅ Sesión desactivada correctamente');
    } else {
      console.log('❌ Error: Sesión no se desactivó');
    }

    // 10. Verificar que las otras sesiones siguen activas
    console.log('\n10. Verificando que otras sesiones siguen activas...');
    const activeSession1 = await SessionService.verifySession(sessionData.sessionId);
    const activeSession3 = await SessionService.verifySession(session3.sessionId);
    
    if (activeSession1 && activeSession3) {
      console.log('✅ Otras sesiones siguen activas');
    } else {
      console.log('❌ Error: Algunas sesiones se desactivaron incorrectamente');
    }

    // 11. Limpiar sesiones expiradas (no debería haber ninguna)
    console.log('\n11. Limpiando sesiones expiradas...');
    const cleanedCount = await SessionService.cleanupExpiredSessions();
    console.log('✅ Sesiones expiradas limpiadas:', cleanedCount);

    // 12. Desactivar todas las sesiones del usuario
    console.log('\n12. Desactivando todas las sesiones del usuario...');
    await SessionService.deactivateAllUserSessions(testUser.id);
    
    const remainingSessions = await SessionService.getUserSessions(testUser.id);
    if (remainingSessions.length === 0) {
      console.log('✅ Todas las sesiones desactivadas correctamente');
    } else {
      console.log('❌ Error: Algunas sesiones no se desactivaron');
    }

    // 13. Limpiar datos de prueba
    console.log('\n13. Limpiando datos de prueba...');
    await testUser.destroy();
    console.log('✅ Usuario de prueba eliminado');

    console.log('\n✅ Prueba del sistema de sesiones completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testSessionSystem().catch(console.error);
