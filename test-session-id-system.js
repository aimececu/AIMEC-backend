const { User, Session } = require('./models');
const SessionService = require('./services/SessionService');

async function testSessionIdSystem() {
  console.log('🧪 Probando sistema basado en Session ID...\n');

  try {
    // 1. Crear un usuario de prueba
    console.log('1. Creando usuario de prueba...');
    const testUser = await User.create({
      email: 'test-session@aimec.com',
      password: 'test123',
      name: 'Usuario Test Session',
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
    console.log('   Expira:', sessionData.expiresAt);
    console.log('   Usuario:', sessionData.user.name);

    // 3. Verificar sesión por sessionId
    console.log('\n3. Verificando sesión por sessionId...');
    const verifiedSession = await SessionService.verifySession(sessionData.sessionId);
    if (verifiedSession) {
      console.log('✅ Sesión verificada correctamente');
      console.log('   Usuario:', verifiedSession.user.name);
      console.log('   Email:', verifiedSession.user.email);
    } else {
      console.log('❌ Error: Sesión no verificada');
    }

    // 4. Verificar que los tokens internos se crearon correctamente
    console.log('\n4. Verificando tokens internos en base de datos...');
    const sessionInDB = await Session.findOne({
      where: { session_id: sessionData.sessionId }
    });
    
    if (sessionInDB) {
      console.log('✅ Sesión encontrada en base de datos');
      console.log('   Access Token presente:', !!sessionInDB.access_token);
      console.log('   Refresh Token presente:', !!sessionInDB.token);
      console.log('   IP Address:', sessionInDB.ip_address);
      console.log('   User Agent:', sessionInDB.user_agent?.substring(0, 50) + '...');
    } else {
      console.log('❌ Error: Sesión no encontrada en base de datos');
    }

    // 5. Probar renovación automática de access token
    console.log('\n5. Probando renovación automática de access token...');
    
    // Obtener el access token actual
    const currentSession = await Session.findOne({
      where: { session_id: sessionData.sessionId }
    });
    
    if (currentSession) {
      console.log('   Access Token actual:', currentSession.access_token.substring(0, 50) + '...');
      
      // Forzar renovación del access token
      const renewedSession = await SessionService.renewAccessToken(sessionData.sessionId);
      console.log('✅ Access token renovado internamente');
      
      // Verificar que el access token cambió
      const updatedSession = await Session.findOne({
        where: { session_id: sessionData.sessionId }
      });
      
      if (updatedSession.access_token !== currentSession.access_token) {
        console.log('✅ Access token actualizado en base de datos');
        console.log('   Nuevo Access Token:', updatedSession.access_token.substring(0, 50) + '...');
      } else {
        console.log('❌ Error: Access token no se actualizó');
      }
    }

    // 6. Crear múltiples sesiones
    console.log('\n6. Creando múltiples sesiones...');
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

    // 7. Obtener todas las sesiones del usuario
    console.log('\n7. Obteniendo todas las sesiones del usuario...');
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

    // 8. Desactivar una sesión específica
    console.log('\n8. Desactivando una sesión específica...');
    await SessionService.deactivateSession(session2.sessionId);
    const deactivatedSession = await SessionService.verifySession(session2.sessionId);
    if (!deactivatedSession) {
      console.log('✅ Sesión desactivada correctamente');
    } else {
      console.log('❌ Error: Sesión no se desactivó');
    }

    // 9. Verificar que las otras sesiones siguen activas
    console.log('\n9. Verificando que otras sesiones siguen activas...');
    const activeSession1 = await SessionService.verifySession(sessionData.sessionId);
    const activeSession3 = await SessionService.verifySession(session3.sessionId);

    if (activeSession1 && activeSession3) {
      console.log('✅ Otras sesiones siguen activas');
    } else {
      console.log('❌ Error: Algunas sesiones se desactivaron incorrectamente');
    }

    // 10. Limpiar sesiones expiradas (no debería haber ninguna)
    console.log('\n10. Limpiando sesiones expiradas...');
    const cleanedCount = await SessionService.cleanupExpiredSessions();
    console.log('✅ Sesiones expiradas limpiadas:', cleanedCount);

    // 11. Desactivar todas las sesiones del usuario
    console.log('\n11. Desactivando todas las sesiones del usuario...');
    await SessionService.deactivateAllUserSessions(testUser.id);

    const remainingSessions = await SessionService.getUserSessions(testUser.id);
    if (remainingSessions.length === 0) {
      console.log('✅ Todas las sesiones desactivadas correctamente');
    } else {
      console.log('❌ Error: Algunas sesiones no se desactivaron');
    }

    // 12. Verificar que las sesiones ya no son válidas
    console.log('\n12. Verificando que las sesiones ya no son válidas...');
    const invalidSession1 = await SessionService.verifySession(sessionData.sessionId);
    const invalidSession3 = await SessionService.verifySession(session3.sessionId);

    if (!invalidSession1 && !invalidSession3) {
      console.log('✅ Todas las sesiones correctamente invalidadas');
    } else {
      console.log('❌ Error: Algunas sesiones siguen siendo válidas');
    }

    // 13. Limpiar datos de prueba
    console.log('\n13. Limpiando datos de prueba...');
    await testUser.destroy();
    console.log('✅ Usuario de prueba eliminado');

    console.log('\n✅ Prueba del sistema basado en Session ID completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testSessionIdSystem().catch(console.error);
