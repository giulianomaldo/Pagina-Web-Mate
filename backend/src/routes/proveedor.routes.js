'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/proveedor.controller');
const v = require('../validators/proveedor.validators');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, anyAdmin, onlySuperAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Todas las rutas de proveedores requieren autenticación
router.use(verifyToken);

// ── Rutas protegidas — cualquier admin ───────────────────────────────

router.get(
  '/',
  anyAdmin,
  v.listarValidator,
  validate,
  ctrl.listar,
);

router.get(
  '/:id',
  anyAdmin,
  v.getOneValidator,
  validate,
  ctrl.obtener,
);

router.post(
  '/',
  anyAdmin,
  v.crearValidator,
  validate,
  ctrl.crear,
);

router.put(
  '/:id',
  anyAdmin,
  v.actualizarValidator,
  validate,
  ctrl.actualizar,
);

router.patch(
  '/:id/activar',
  anyAdmin,
  v.idOnlyValidator, validate,
  ctrl.activar,
);

router.patch(
  '/:id/desactivar',
  anyAdmin,
  v.idOnlyValidator, validate,
  ctrl.desactivar,
);

// ── DELETE — solo superadmin ──────────────────────────────────────────

router.delete(
  '/:id',
  onlySuperAdmin,
  v.idOnlyValidator, validate,
  ctrl.eliminar,
);

module.exports = router;
