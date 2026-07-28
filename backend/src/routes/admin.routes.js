'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');
const v = require('../validators/admin.validators');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, onlySuperAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// ── Rutas Protegidas (SOLO SuperAdmin) ────────────────────────────────
router.use(verifyToken, onlySuperAdmin);

router.get(
  '/',
  ctrl.listar,
);

router.get(
  '/:id',
  v.idParam,
  validate,
  ctrl.obtener,
);

router.post(
  '/',
  v.crearValidator,
  validate,
  ctrl.crear,
);

router.put(
  '/:id',
  v.actualizarValidator,
  validate,
  ctrl.actualizar,
);

router.patch(
  '/:id/activar',
  v.idParam,
  validate,
  ctrl.activar,
);

router.patch(
  '/:id/desactivar',
  v.idParam,
  validate,
  ctrl.desactivar,
);

module.exports = router;
