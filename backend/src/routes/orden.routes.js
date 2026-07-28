'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/orden.controller');
const v = require('../validators/orden.validators');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, anyAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// ── Rutas Públicas ────────────────────────────────────────────────────
// Permite a cualquier cliente crear un pedido desde el carrito
router.post(
  '/',
  v.crearValidator,
  validate,
  ctrl.crear,
);

// ── Rutas Protegidas (Admin) ──────────────────────────────────────────
router.use(verifyToken, anyAdmin);

router.get(
  '/',
  v.listarValidator,
  validate,
  ctrl.listar,
);

router.get(
  '/:id',
  v.idParam,
  validate,
  ctrl.obtener,
);

router.patch(
  '/:id/estado',
  v.statusValidator,
  validate,
  ctrl.cambiarEstado,
);

module.exports = router;
