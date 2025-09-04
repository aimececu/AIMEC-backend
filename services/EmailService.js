const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configuración del transporter de nodemailer para Zoho Mail
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT) === 465, // true para 465 (SSL), false para 587 (TLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Configuraciones adicionales para Zoho Mail
      tls: {
        rejectUnauthorized: false // Para evitar problemas de certificados en desarrollo
      }
    });

    // Verificar la configuración del transporter (opcional para cuentas gratuitas)
    this.transporter.verify((error, success) => {
      if (error) {
        console.log('Advertencia en configuración de email (normal para cuentas gratuitas):', error.message);
        console.log('El servicio seguirá funcionando para envío de correos');
      } else {
        console.log('Servidor de correo listo para enviar mensajes');
      }
    });
  }

  async sendContactEmail(contactData) {
    try {
      const { name, email, phone, company, message } = contactData;

      // Validar datos requeridos
      if (!name || !email || !message) {
        throw new Error('Nombre, email y mensaje son requeridos');
      }

      // Configurar el correo
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        subject: `Nuevo mensaje de contacto - ${name}`,
        html: this.generateContactEmailHTML(contactData),
        text: this.generateContactEmailText(contactData),
      };

      // Enviar el correo
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Correo de contacto enviado:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Correo enviado exitosamente'
      };

    } catch (error) {
      console.error('Error enviando correo de contacto:', error);
      throw new Error(`Error enviando correo: ${error.message}`);
    }
  }

  generateContactEmailHTML(contactData) {
    const { name, email, phone, company, message } = contactData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo mensaje de contacto</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8fafc; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #475569; }
          .value { margin-top: 5px; }
          .message-box { background-color: white; padding: 15px; border-left: 4px solid #2563eb; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo mensaje de contacto</h1>
            <p>Formulario de contacto - AIMEC</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Nombre:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="label">Teléfono:</div>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            ${company ? `
            <div class="field">
              <div class="label">Empresa:</div>
              <div class="value">${company}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Mensaje:</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateContactEmailText(contactData) {
    const { name, email, phone, company, message } = contactData;
    
    return `
Nuevo mensaje de contacto - AIMEC

Nombre: ${name}
Email: ${email}
${phone ? `Teléfono: ${phone}` : ''}
${company ? `Empresa: ${company}` : ''}

Mensaje:
${message}

---
Este mensaje fue enviado desde el formulario de contacto de AIMEC.
    `;
  }

  generateQuotationEmailHTML(quotationData) {
    const { customerInfo, items, total, notes } = quotationData;
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const itemsHTML = items.map((item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName || 'Producto'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">$${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cotización AIMEC</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .customer-info { background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .quotation-table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .quotation-table th { background-color: #2563eb; color: white; padding: 15px; text-align: left; font-weight: bold; }
          .quotation-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .total-section { background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: right; }
          .notes-section { background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cotización AIMEC</h1>
            <p>Componentes Industriales y Servicios Técnicos</p>
            <p>Fecha: ${currentDate}</p>
          </div>
          
          <div class="content">
            <div class="customer-info">
              <h3 style="margin-top: 0; color: #2563eb;">Información del Cliente</h3>
              <p><strong>Nombre:</strong> ${customerInfo.name}</p>
              <p><strong>Email:</strong> ${customerInfo.email}</p>
              ${customerInfo.phone ? `<p><strong>Teléfono:</strong> ${customerInfo.phone}</p>` : ''}
              ${customerInfo.company ? `<p><strong>Empresa:</strong> ${customerInfo.company}</p>` : ''}
            </div>

            <h3 style="color: #2563eb;">Detalle de la Cotización</h3>
            <table class="quotation-table">
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Producto</th>
                  <th style="width: 80px; text-align: center;">Cantidad</th>
                  <th style="width: 100px; text-align: right;">Precio Unit.</th>
                  <th style="width: 120px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="total-section">
              <h2 style="margin: 0; font-size: 24px;">Total: $${total.toFixed(2)}</h2>
            </div>

            ${notes ? `
            <div class="notes-section">
              <h3 style="margin-top: 0; color: #2563eb;">Notas Adicionales</h3>
              <p>${notes.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}

            <div class="footer">
              <p>Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
              <p>Para más información, contáctanos al email: ${process.env.CONTACT_EMAIL || process.env.SMTP_USER}</p>
              <p><strong>AIMEC</strong> - Componentes Industriales y Servicios Técnicos</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateQuotationEmailText(quotationData) {
    const { customerInfo, items, total, notes } = quotationData;
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const itemsText = items.map((item, index) => 
      `${index + 1}. ${item.productName || 'Producto'} - Cantidad: ${item.quantity} - Precio: $${item.price.toFixed(2)} - Total: $${item.total.toFixed(2)}`
    ).join('\n');
    
    return `
COTIZACIÓN AIMEC
Componentes Industriales y Servicios Técnicos

Fecha: ${currentDate}

INFORMACIÓN DEL CLIENTE:
Nombre: ${customerInfo.name}
Email: ${customerInfo.email}
${customerInfo.phone ? `Teléfono: ${customerInfo.phone}` : ''}
${customerInfo.company ? `Empresa: ${customerInfo.company}` : ''}

DETALLE DE LA COTIZACIÓN:
${itemsText}

TOTAL: $${total.toFixed(2)}

${notes ? `NOTAS ADICIONALES:\n${notes}` : ''}

---
Esta cotización es válida por 30 días a partir de la fecha de emisión.
Para más información, contáctanos al email: ${process.env.CONTACT_EMAIL || process.env.SMTP_USER}

AIMEC - Componentes Industriales y Servicios Técnicos
    `;
  }

  async sendQuotationEmail(quotationData) {
    try {
      const { customerInfo, items, total, notes } = quotationData;

      // Validar datos requeridos
      if (!customerInfo || !items || !total) {
        throw new Error('Datos de cotización incompletos');
      }

      // Configurar el correo
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: customerInfo.email,
        cc: process.env.CONTACT_EMAIL || process.env.SMTP_USER, // Copia a la empresa
        subject: `Cotización AIMEC - ${customerInfo.name}`,
        html: this.generateQuotationEmailHTML(quotationData),
        text: this.generateQuotationEmailText(quotationData),
      };

      // Enviar el correo
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Correo de cotización enviado:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Cotización enviada exitosamente'
      };

    } catch (error) {
      console.error('Error enviando correo de cotización:', error);
      throw new Error(`Error enviando cotización: ${error.message}`);
    }
  }

  async sendTestEmail() {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: 'Test de configuración de correo - AIMEC',
        text: 'Este es un correo de prueba para verificar la configuración del servidor de correo.',
        html: '<p>Este es un correo de prueba para verificar la configuración del servidor de correo.</p>'
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Correo de prueba enviado:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Correo de prueba enviado exitosamente'
      };

    } catch (error) {
      console.error('Error enviando correo de prueba:', error);
      throw new Error(`Error enviando correo de prueba: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
