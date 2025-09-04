const EmailService = require('../services/EmailService');
const { validateEmail, validateText } = require('../config/validation');

/**
 * Enviar cotización por email
 * POST /api/quotations/send
 */
const sendQuotation = async (req, res) => {
  try {
    const { customerInfo, items, total, notes } = req.body;

    // Validar datos requeridos
    if (!customerInfo || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Información del cliente e items son requeridos'
      });
    }

    // Validar información del cliente
    if (!customerInfo.name || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y email del cliente son requeridos'
      });
    }

    // Validar formato de email
    try {
      validateEmail(customerInfo.email);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Validar nombre
    try {
      validateText(customerInfo.name, 'Nombre', 2, 100);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Validar items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          error: `Item ${i + 1}: Producto, cantidad y precio son requeridos`
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: `Item ${i + 1}: La cantidad debe ser mayor a 0`
        });
      }

      if (item.price <= 0) {
        return res.status(400).json({
          success: false,
          error: `Item ${i + 1}: El precio debe ser mayor a 0`
        });
      }
    }

    // Validar total
    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El total debe ser mayor a 0'
      });
    }

    // Validar teléfono si se proporciona
    if (customerInfo.phone && customerInfo.phone.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono no puede exceder 20 caracteres'
      });
    }

    // Validar empresa si se proporciona
    if (customerInfo.company && customerInfo.company.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la empresa no puede exceder 100 caracteres'
      });
    }

    // Validar notas si se proporcionan
    if (notes && notes.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Las notas no pueden exceder 1000 caracteres'
      });
    }

    // Preparar datos de la cotización
    const quotationData = {
      customerInfo: {
        name: customerInfo.name.trim(),
        email: customerInfo.email.trim().toLowerCase(),
        phone: customerInfo.phone ? customerInfo.phone.trim() : null,
        company: customerInfo.company ? customerInfo.company.trim() : null
      },
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName || '',
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        total: parseFloat(item.total || (item.quantity * item.price))
      })),
      total: parseFloat(total),
      notes: notes ? notes.trim() : null
    };

    // Enviar cotización por email
    const result = await EmailService.sendQuotationEmail(quotationData);

    // Log del envío
    console.log(`Cotización enviada a ${customerInfo.email} (${customerInfo.name}) - Total: $${total}`);

    res.status(200).json({
      success: true,
      message: 'Cotización enviada exitosamente. El cliente recibirá un email con los detalles.',
      data: {
        messageId: result.messageId,
        customerEmail: customerInfo.email,
        total: total
      }
    });

  } catch (error) {
    console.error('Error en sendQuotation:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor. Por favor, intenta nuevamente.'
    });
  }
};

module.exports = {
  sendQuotation
};
