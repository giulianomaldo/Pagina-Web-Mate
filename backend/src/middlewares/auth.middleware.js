'use strict';

const tokenService         = require('../services/token.service');
const { UsuarioAdministrador } = require('../models');
const ApiError             = require('../utils/ApiError');

/**
 * auth.middleware.js
 *
 * Middlewares de autenticación y autorización.
 *
 * Uso típico en rutas:
 *
 *   // Solo necesita estar autenticado
 *   router.get('/me', verifyToken, authController.me);
 *
 *   // Solo superadmin
 *   router.delete('/users/:id', verifyToken, requireRole('superadmin'), userController.delete);
 *
 *   // Superadmin o editor
 *   router.get('/products', verifyToken, requireRole('superadmin', 'editor'), productController.index);
 */

// ── verifyToken ───────────────────────────────────────────────────────

/**
 * Extrae y verifica el Bearer token del header Authorization.
 * Si es válido, carga el admin desde la DB y lo adjunta a req.admin.
 *
 * Por qué consultamos la DB en cada request:
 *   - Para detectar admins desactivados (is_active = false) incluso
 *     si su token aún no expiró.
 *   - Para tener el admin completo disponible en los controllers.
 *   - Alternativa: usar un campo is_active en el payload y aceptar
 *     el riesgo de hasta 15 min de desfase.
 */
async function verifyToken(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token de acceso requerido.');
    }

    const token   = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);

    // Consultamos la DB para verificar que el admin sigue activo
    const admin = await UsuarioAdministrador.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'is_active'],
    });

    if (!admin) {
      throw ApiError.unauthorized('El usuario asociado al token no existe.');
    }

    if (!admin.is_active) {
      throw ApiError.forbidden('Tu cuenta está desactivada. Contactá al administrador.');
    }

    // Adjuntamos el admin al request para uso en controllers y middlewares siguientes
    req.admin = admin;
    next();

  } catch (err) {
    // Propagamos ApiErrors directamente; los errores JWT los captura error.middleware
    next(err);
  }
}

// ── requireRole ───────────────────────────────────────────────────────

/**
 * Factory de middleware de autorización por rol.
 * Debe usarse DESPUÉS de verifyToken (necesita req.admin).
 *
 * @param {...string} roles - Roles permitidos: 'superadmin', 'editor'
 * @returns {Function} Middleware de Express
 *
 * Ejemplos:
 *   requireRole('superadmin')           // solo superadmin
 *   requireRole('superadmin', 'editor') // cualquier admin autenticado
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.admin) {
      return next(ApiError.unauthorized('No autenticado.'));
    }

    if (!roles.includes(req.admin.rol)) {
      return next(
        ApiError.forbidden(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}.`
        )
      );
    }

    next();
  };
}

// ── Shorthands semánticos ─────────────────────────────────────────────

/** Cualquier admin autenticado (superadmin o editor) */
const anyAdmin = requireRole('superadmin', 'editor');

/** Solo superadmin */
const onlySuperAdmin = requireRole('superadmin');

module.exports = {
  verifyToken,
  requireRole,
  anyAdmin,
  onlySuperAdmin,
};
