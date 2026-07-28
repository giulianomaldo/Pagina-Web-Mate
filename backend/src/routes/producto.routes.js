'use strict';

const { Router } = require('express');
const ctrl    = require('../controllers/producto.controller');
const v       = require('../validators/producto.validators');
const validate = require('../middlewares/validate.middleware');
const { verifyToken, anyAdmin, onlySuperAdmin } = require('../middlewares/auth.middleware');
const { upload, handleMulterError }             = require('../middlewares/upload.middleware');

const router = Router();

/**
 * Producto Routes — /api/productos
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Método  │ Ruta                     │ Auth       │ Descripción  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  GET     │ /                        │ Pública    │ Listar       ║
 * ║  GET     │ /:id                     │ Pública    │ Detalle      ║
 * ║  POST    │ /                        │ anyAdmin   │ Crear        ║
 * ║  PUT     │ /:id                     │ anyAdmin   │ Actualizar   ║
 * ║  DELETE  │ /:id                     │ superAdmin │ Eliminar     ║
 * ║  PATCH   │ /:id/stock               │ anyAdmin   │ Cambiar stock║
 * ║  PATCH   │ /:id/precio              │ anyAdmin   │ Cambiar precio║
 * ║  PATCH   │ /:id/activar             │ anyAdmin   │ Activar      ║
 * ║  PATCH   │ /:id/desactivar          │ anyAdmin   │ Desactivar   ║
 * ║  PATCH   │ /:id/destacado           │ anyAdmin   │ Toggle dest. ║
 * ║  PATCH   │ /:id/nuevo               │ anyAdmin   │ Toggle nuevo ║
 * ║  PATCH   │ /:id/mas-vendido         │ anyAdmin   │ Toggle MV    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Nota sobre GET público:
 *   Si el request incluye Authorization header válido (admin),
 *   el controller recibe req.admin y puede incluir datos extra
 *   (precio_costo, proveedor, productos inactivos con ?includeInactive=true).
 *   Para eso usamos verifyToken como middleware OPCIONAL en las rutas públicas.
 */

// ── Middleware opcional de auth (enriquece el request si hay token) ──

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
  upload.fields([
    { name: 'imagen',   maxCount: 1 },
    { name: 'imagenes', maxCount: 5 },
  ]),
  handleMulterError,
  v.crearValidator,
  validate,
  ctrl.crear,
);

router.put(
  '/:id',
  verifyToken, anyAdmin,
  upload.fields([
    { name: 'imagen',   maxCount: 1 },
    { name: 'imagenes', maxCount: 5 },
  ]),
  handleMulterError,
  v.actualizarValidator,
  validate,
  ctrl.actualizar,
);

// ── Operaciones de campo único (PATCH) ───────────────────────────────

router.patch(
  '/:id/stock',
  verifyToken, anyAdmin,
  v.stockValidator, validate,
  ctrl.cambiarStock,
);

router.patch(
  '/:id/precio',
  verifyToken, anyAdmin,
  v.precioValidator, validate,
  ctrl.cambiarPrecio,
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

router.patch(
  '/:id/destacado',
  verifyToken, anyAdmin,
  v.idOnlyValidator, validate,
  ctrl.toggleDestacado,
);

router.patch(
  '/:id/nuevo',
  verifyToken, anyAdmin,
  v.idOnlyValidator, validate,
  ctrl.toggleNuevo,
);

router.patch(
  '/:id/mas-vendido',
  verifyToken, anyAdmin,
  v.idOnlyValidator, validate,
  ctrl.toggleMasVendido,
);

// ── DELETE — solo superadmin ──────────────────────────────────────────

router.delete(
  '/:id',
  verifyToken, onlySuperAdmin,
  v.idOnlyValidator, validate,
  ctrl.eliminar,
);

module.exports = router;
