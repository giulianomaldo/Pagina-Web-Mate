'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { verifyToken, anyAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Protegemos todas las rutas del dashboard (cualquier admin)
router.use(verifyToken, anyAdmin);

// ── Rutas protegidas ──────────────────────────────────────────────────

// GET /api/dashboard/stats
router.get(
  '/stats',
  ctrl.obtenerEstadisticas,
);

module.exports = router;
