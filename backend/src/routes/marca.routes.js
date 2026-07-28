'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/marca.controller');
const v = require('../validators/marca.validators');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, anyAdmin, onlySuperAdmin } = require('../middlewares/auth.middleware');
const { upload, handleMulterError } = require('../middlewares/upload.middleware');

const router = Router();

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
}

// ── Rutas públicas (con auth opcional) ───────────────────────────────

router.get(
  '/',
  optionalAuth,
  v.listarValidator,
  validate,
  ctrl.listar,
);

router.get(
  '/:id',
  optionalAuth,
  v.getOneValidator,
  validate,
  ctrl.obtener,
);

// ── Rutas protegidas — cualquier admin ───────────────────────────────

router.post(
  '/',
  verifyToken, anyAdmin,
  upload.single('logo'),
  handleMulterError,
  v.crearValidator,
  validate,
  ctrl.crear,
);

router.put(
  '/:id',
  verifyToken, anyAdmin,
  upload.single('logo'),
  handleMulterError,
  v.actualizarValidator,
  validate,
  ctrl.actualizar,
);

router.patch(
  '/:id/activar',
  verifyToken, anyAdmin,
  v.idOnlyValidator, validate,
  ctrl.activar,
);

router.patch(
  '/:id/desactivar',
  verifyToken, anyAdmin,
  v.idOnlyValidator, validate,
  ctrl.desactivar,
);

// ── DELETE — solo superadmin ──────────────────────────────────────────

router.delete(
  '/:id',
  verifyToken, onlySuperAdmin,
  v.idOnlyValidator, validate,
  ctrl.eliminar,
);

module.exports = router;
