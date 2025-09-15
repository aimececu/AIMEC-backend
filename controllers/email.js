const EmailService = require('../services/EmailService');
const { validateEmail, validateText } = require('../config/validation');

/**
 * Enviar correo de contacto
 * POST /api/email/contact
 */
const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    // Validar datos requeridos
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y mensaje son requeridos'
      });
    }

    // Validar formato de email
    try {
      validateEmail(email);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Validar longitud del mensaje
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje debe tener al menos 10 caracteres'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede exceder 2000 caracteres'
      });
    }

    // Validar nombre
    try {
      validateText(name, 'Nombre', 2, 100);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Validar teléfono si se proporciona
    if (phone && phone.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono no puede exceder 20 caracteres'
      });
    }

    // Validar empresa si se proporciona
    if (company && company.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la empresa no puede exceder 100 caracteres'
      });
    }

    // Preparar datos del contacto
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      company: company ? company.trim() : null,
      message: message.trim()
    };

    // Enviar correo
    const result = await EmailService.sendContactEmail(contactData);

    // Log del envío
    console.log(`Correo de contacto enviado desde ${email} (${name})`);

    res.status(200).json({
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
      data: {
        messageId: result.messageId
      }
    });

  } catch (error) {
    console.error('Error en sendContactEmail:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor. Por favor, intenta nuevamente.'
    });
  }
};

/**
 * Enviar correo de prueba
 * POST /api/email/test
 */
const sendTestEmail = async (req, res) => {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Esta funcionalidad no está disponible en producción'
      });
    }

    const result = await EmailService.sendTestEmail();

    res.status(200).json({
      success: true,
      message: 'Correo de prueba enviado exitosamente',
      data: {
        messageId: result.messageId
      }
    });

  } catch (error) {
    console.error('Error en sendTestEmail:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error enviando correo de prueba: ' + error.message
    });
  }
};

/**
 * Verificar configuración de correo
 * GET /api/email/status
 */
const getEmailStatus = async (req, res) => {
  try {
    // Verificar si las variables de entorno de SMTP2GO están configuradas
    const isConfigured = !!(
      process.env.SMTP2GO_API_KEY &&
      process.env.SMTP2GO_FROM_EMAIL
    );

    res.status(200).json({
      success: true,
      data: {
        configured: isConfigured,
        service: 'SMTP2GO',
        apiKey: process.env.SMTP2GO_API_KEY ? '***' + process.env.SMTP2GO_API_KEY.slice(-4) : null,
        fromEmail: process.env.SMTP2GO_FROM_EMAIL || null,
        fromName: process.env.SMTP2GO_FROM_NAME || 'AIMEC',
        contactEmail: process.env.CONTACT_EMAIL || null
      }
    });

  } catch (error) {
    console.error('Error en getEmailStatus:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error verificando configuración de correo'
    });
  }
};

/**
 * Probar conexión SMTP2GO
 * POST /api/email/test-connection
 */
const testSMTPConnection = async (req, res) => {
  try {
    console.log('Probando conexión SMTP2GO...');
    
    const result = await EmailService.testConnection();
    
    res.status(200).json({
      success: true,
      message: result.message,
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Error en testSMTPConnection:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  sendContactEmail,
  sendTestEmail,
  getEmailStatus,
  testSMTPConnection
};
