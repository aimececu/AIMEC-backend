const express = require('express');
const router = express.Router();
const { verifySession, requireAdmin } = require('../controllers/auth');
const {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getProductApplications,
  assignApplicationsToProduct
} = require('../controllers/applications');

// Rutas públicas
router.get('/', getAllApplications);
router.get('/:productId/applications', getProductApplications);

// Rutas protegidas (requieren autenticación)
router.post('/', verifySession, requireAdmin, createApplication);
router.put('/:id', verifySession, requireAdmin, updateApplication);
router.delete('/:id', verifySession, requireAdmin, deleteApplication);
router.post('/:productId/applications', verifySession, requireAdmin, assignApplicationsToProduct);

module.exports = router; 