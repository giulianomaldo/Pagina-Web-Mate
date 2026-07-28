'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/banner.controller');
const v = require('../validators/banner.validators');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, anyAdmin } = require('../middlewares/auth.middleware');
const { upload, handleMulterError } = require('../middlewares/upload.middleware');

const router = Router();

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
}

// ── Rutas públicas (con auth opcional para admin views) ───────────────

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
router.use(verifyToken, anyAdmin);

router.post(
  '/',
  upload.single('imagen'),
  handleMulterError,
  v.crearValidator,
  validate,
  ctrl.crear,
);

router.put(
  '/:id',
  upload.single('imagen'),
  handleMulterError,
  v.actualizarValidator,
  validate,
  ctrl.actualizar,
);

router.patch(
  '/:id/activar',
  v.idOnlyValidator, validate,
  ctrl.activar,
);

router.patch(
  '/:id/desactivar',
  v.idOnlyValidator, validate,
  ctrl.desactivar,
);

router.delete(
  '/:id',
  v.idOnlyValidator, validate,
  ctrl.eliminar,
);

module.exports = router;
