const express = require('express');
const router = express.Router();
const { verifySession, requireAdmin } = require('../controllers/auth');
const {
  getProductRelated,
  addProductRelated,
  updateProductRelated,
  deleteProductRelated,
  bulkAssignRelatedProducts
} = require('../controllers/productRelated');

// Rutas públicas
router.get('/:productId/related', getProductRelated);

// Rutas protegidas (requieren autenticación)
router.post('/:productId/related', verifySession, requireAdmin, addProductRelated);
router.put('/:productId/related/:relatedId', verifySession, requireAdmin, updateProductRelated);
router.delete('/:productId/related/:relatedId', verifySession, requireAdmin, deleteProductRelated);
router.post('/:productId/related/bulk', verifySession, requireAdmin, bulkAssignRelatedProducts);

module.exports = router; 