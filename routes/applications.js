const express = require('express');
const router = express.Router();
const { verifySession, requireAdmin } = require('../controllers/auth');
const {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication
} = require('../controllers/applications');

// Rutas públicas
router.get('/', getAllApplications);

// Rutas protegidas (requieren autenticación)
router.post('/', verifySession, requireAdmin, createApplication);
router.put('/:id', verifySession, requireAdmin, updateApplication);
router.delete('/:id', verifySession, requireAdmin, deleteApplication);

module.exports = router; 