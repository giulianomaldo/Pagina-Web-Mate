'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/promocion.controller');
const v = require('../validators/promocion.validators');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, anyAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// ── Rutas Públicas ────────────────────────────────────────────────────

// Permite al frontend validar un cupón contra el carrito actual
router.post(
  '/validar',
  v.validarCuponValidator,
  validate,
  ctrl.validarCupon,
);

// Listar promociones (se forzará ?activas=true en el repo si no es admin, pero lo manejamos así por ahora o forzándolo)
// Para que sea seguro, hacemos un wrapper de auth o forzamos activas=true.
router.get(
  '/',
  (req, res, next) => {
    // Si no tiene auth, forzamos activas=true
    if (!req.headers.authorization) {
      req.query.activas = 'true';
    }
    next();
  },
  v.listarValidator,
  validate,
  ctrl.listar,
);

// ── Rutas Protegidas (Admin) ──────────────────────────────────────────
router.use(verifyToken, anyAdmin);

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

router.delete(
  '/:id',
  v.idParam,
  validate,
  ctrl.eliminar,
);

module.exports = router;
