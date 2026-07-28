'use strict';

const tokenService         = require('../services/token.service');
const { UsuarioAdministrador } = require('../models');
const ApiResponse          = require('../utils/ApiResponse');
const ApiError             = require('../utils/ApiError');
const { server }           = require('../config/env');

// Duración del refresh token en ms (para la cookie)
const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Configuración base de la cookie del refresh token.
 * httpOnly:  JavaScript del cliente no puede leerla (protege contra XSS)
 * secure:    Solo HTTPS en producción
 * sameSite:  'strict' en producción, 'lax' en dev (permite peticiones locales)
 */
const refreshCookieOptions = {
  httpOnly: true,
  secure:   !server.isDev,
  sameSite: server.isDev ? 'lax' : 'strict',
  maxAge:   REFRESH_TOKEN_MS,
  path:     '/api/auth', // La cookie solo se envía a rutas de auth
};

// ═══════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════════════════════════════════

/**
 * Autentica un administrador con email y contraseña.
 *
 * Flujo:
 *  1. Busca al admin por email (incluyendo password_hash)
 *  2. Verifica la contraseña con bcrypt
 *  3. Genera access token + refresh token
 *  4. Persiste el refresh token en DB
 *  5. Envía el refresh token en cookie httpOnly
 *  6. Devuelve el access token en el body + datos del admin
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. Buscar admin — incluimos password_hash que normalmente está excluido
    const admin = await UsuarioAdministrador.findOne({
      where:      { email: email.toLowerCase() },
      // No usamos scope de exclusión aquí para poder verificar la contraseña
    });

    // Mensaje genérico para no dar pistas sobre si el email existe o no
    if (!admin) {
      throw ApiError.unauthorized('Credenciales incorrectas.');
    }

    if (!admin.is_active) {
      throw ApiError.forbidden('Tu cuenta está desactivada.');
    }

    // 2. Verificar contraseña
    const passwordValida = await admin.verificarPassword(password);
    if (!passwordValida) {
      throw ApiError.unauthorized('Credenciales incorrectas.');
    }

    // 3. Generar tokens
    const accessToken  = tokenService.signAccessToken({ id: admin.id, rol: admin.rol });
    const refreshToken = tokenService.signRefreshToken({ id: admin.id });

    // 4. Persistir refresh token en DB
    await tokenService.saveRefreshToken(
      admin.id,
      refreshToken,
      req.ip,
      req.get('User-Agent'),
    );

    // 5. Actualizar último login
    await admin.update({ ultimo_login: new Date() });

    // 6. Enviar refresh token en cookie httpOnly
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    // 7. Responder con access token + perfil público
    return ApiResponse.ok(res, 'Sesión iniciada correctamente.', {
      accessToken,
      admin: admin.toPublicJSON(),
    });

  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/auth/logout
// ═══════════════════════════════════════════════════════════════════════

/**
 * Cierra la sesión del administrador actual.
 *
 * Elimina el refresh token de la DB e invalida la cookie.
 * El access token expirará solo (duración máxima: 15 min).
 *
 * Para logout inmediato del AT, implementar una lista negra en Redis.
 * No se hace aquí para no agregar dependencias al stack inicial.
 */
async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      // Eliminamos de la DB (ignoramos si no existía — idempotente)
      await tokenService.deleteRefreshToken(refreshToken);
    }

    // Limpiar la cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   !server.isDev,
      sameSite: server.isDev ? 'lax' : 'strict',
      path:     '/api/auth',
    });

    return ApiResponse.ok(res, 'Sesión cerrada correctamente.');

  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/auth/logout-all
// ═══════════════════════════════════════════════════════════════════════

/**
 * Cierra la sesión en TODOS los dispositivos del admin autenticado.
 * Requiere verifyToken (req.admin disponible).
 */
async function logoutAll(req, res, next) {
  try {
    await tokenService.deleteAllRefreshTokens(req.admin.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   !server.isDev,
      sameSite: server.isDev ? 'lax' : 'strict',
      path:     '/api/auth',
    });

    return ApiResponse.ok(res, 'Sesión cerrada en todos los dispositivos.');

  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// ═══════════════════════════════════════════════════════════════════════

/**
 * Genera un nuevo access token a partir de un refresh token válido.
 *
 * El refresh token puede venir de:
 *   a) Cookie httpOnly 'refreshToken'  (web browser)
 *   b) Body { refreshToken: "..." }    (mobile apps, Postman)
 *
 * Estrategia de rotación:
 *   - Elimina el RT antiguo de la DB
 *   - Genera y persiste un RT nuevo
 *   - Envía el nuevo RT en cookie
 *   - Devuelve el nuevo AT en body
 *
 * Esto invalida el RT anterior, haciendo que si alguien lo robó,
 * no pueda usarlo una vez que el legítimo haya rotado.
 */
async function refresh(req, res, next) {
  try {
    // 1. Extraer refresh token de cookie o body
    const incomingRT = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRT) {
      throw ApiError.unauthorized('Refresh token no proporcionado.');
    }

    // 2. Verificar firma JWT del refresh token
    let decoded;
    try {
      decoded = tokenService.verifyRefreshToken(incomingRT);
    } catch {
      // TokenExpiredError o JsonWebTokenError
      throw ApiError.unauthorized('Refresh token inválido o expirado.');
    }

    // 3. Verificar que existe en la DB y no fue revocado
    await tokenService.findRefreshToken(incomingRT);

    // 4. Verificar que el admin sigue activo
    const admin = await UsuarioAdministrador.findByPk(decoded.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'is_active'],
    });

    if (!admin || !admin.is_active) {
      throw ApiError.unauthorized('Usuario inválido o inactivo.');
    }

    // 5. Rotar: eliminar RT antiguo y crear uno nuevo
    await tokenService.deleteRefreshToken(incomingRT);

    const newAccessToken  = tokenService.signAccessToken({ id: admin.id, rol: admin.rol });
    const newRefreshToken = tokenService.signRefreshToken({ id: admin.id });

    await tokenService.saveRefreshToken(
      admin.id,
      newRefreshToken,
      req.ip,
      req.get('User-Agent'),
    );

    // 6. Actualizar cookie
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

    // 7. Responder
    return ApiResponse.ok(res, 'Token renovado correctamente.', {
      accessToken: newAccessToken,
    });

  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GET /api/auth/me
// ═══════════════════════════════════════════════════════════════════════

/**
 * Devuelve el perfil del admin autenticado.
 * req.admin es inyectado por verifyToken.
 */
async function me(req, res, next) {
  try {
    return ApiResponse.ok(res, 'Perfil obtenido.', {
      admin: req.admin.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, logoutAll, refresh, me };
