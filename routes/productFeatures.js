const express = require('express');
const router = express.Router();
const { verifySession, requireAdmin } = require('../controllers/auth');
const {
  getProductFeatures,
  addProductFeature,
  updateProductFeature,
  deleteProductFeature,
  bulkAssignFeatures
} = require('../controllers/productFeatures');

// Rutas públicas
router.get('/:productId/features', getProductFeatures);

// Rutas protegidas (requieren autenticación)
router.post('/:productId/features', verifySession, requireAdmin, addProductFeature);
router.put('/:productId/features/:featureId', verifySession, requireAdmin, updateProductFeature);
router.delete('/:productId/features/:featureId', verifySession, requireAdmin, deleteProductFeature);
router.post('/:productId/features/bulk', verifySession, requireAdmin, bulkAssignFeatures);

module.exports = router; 