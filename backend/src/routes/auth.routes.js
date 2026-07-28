'use strict';

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { loginValidator, refreshValidator } = require('../validators/auth.validators');
const validate   = require('../middlewares/validate.middleware');
const { verifyToken, anyAdmin } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = Router();

/**
 * Auth Routes — /api/auth
 *
 * POST   /login       → Iniciar sesión (pública)
 * POST   /logout      → Cerrar sesión (pública — el AT puede estar expirado)
 * POST   /logout-all  → Cerrar sesión en todos los dispositivos (requiere AT válido)
 * POST   /refresh     → Renovar access token con refresh token (pública)
 * GET    /me          → Perfil del admin autenticado (requiere AT válido)
 */

// ── Públicas ──────────────────────────────────────────────────────────

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  authController.login,
);

router.post(
  '/logout',
  authController.logout,
);

router.post(
  '/refresh',
  refreshValidator,
  validate,
  authController.refresh,
);

// ── Protegidas (requieren access token válido) ────────────────────────

router.post(
  '/logout-all',
  verifyToken,
  authController.logoutAll,
);

router.get(
  '/me',
  verifyToken,
  authController.me,
);

module.exports = router;
