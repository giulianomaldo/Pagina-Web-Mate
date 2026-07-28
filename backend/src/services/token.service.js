'use strict';

const jwt    = require('jsonwebtoken');
const { jwt: jwtCfg } = require('../config/env');
const { RefreshToken } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * token.service.js
 *
 * Centraliza toda la lógica de JWT:
 *  - Firma de access y refresh tokens
 *  - Verificación de ambos
 *  - Persistencia de refresh tokens en DB
 *  - Eliminación (logout simple y logout de todos los dispositivos)
 */

// ── Firma ─────────────────────────────────────────────────────────────

/**
 * Genera un access token de corta vida (15 min por defecto).
 * @param {{ id: number, rol: string }} payload
 * @returns {string} JWT firmado
 */
function signAccessToken(payload) {
  return jwt.sign(
    { id: payload.id, rol: payload.rol },
    jwtCfg.secret,
    { expiresIn: jwtCfg.expiresIn },
  );
}

/**
 * Genera un refresh token de larga vida (7 días por defecto).
 * Solo contiene el id del admin para minimizar la superficie del payload.
 * @param {{ id: number }} payload
 * @returns {string} JWT firmado
 */
function signRefreshToken(payload) {
  return jwt.sign(
    { id: payload.id },
    jwtCfg.refreshSecret,
    { expiresIn: jwtCfg.refreshExpiresIn },
  );
}

// ── Verificación ──────────────────────────────────────────────────────

/**
 * Verifica y decodifica un access token.
 * Lanza TokenExpiredError o JsonWebTokenError si es inválido.
 * @param {string} token
 * @returns {{ id: number, rol: string, iat: number, exp: number }}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, jwtCfg.secret);
}

/**
 * Verifica y decodifica un refresh token.
 * @param {string} token
 * @returns {{ id: number, iat: number, exp: number }}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, jwtCfg.refreshSecret);
}

// ── Persistencia en DB ────────────────────────────────────────────────

/**
 * Decodifica el exp del token para calcular la fecha de expiración
 * y guardar el registro en refresh_tokens.
 * @param {number}  adminId
 * @param {string}  token
 * @param {string}  [ip]
 * @param {string}  [userAgent]
 * @returns {Promise<RefreshToken>}
 */
async function saveRefreshToken(adminId, token, ip = null, userAgent = null) {
  // Decodificamos sin verificar para leer el exp (ya fue firmado por nosotros)
  const decoded  = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  return RefreshToken.create({
    admin_id:   adminId,
    token,
    expira_en:  expiresAt,
    ip_address: ip,
    user_agent: userAgent,
  });
}

/**
 * Elimina un refresh token específico de la DB.
 * Usado en logout de un solo dispositivo.
 * @param {string} token
 * @returns {Promise<number>} Filas eliminadas (0 = no existía)
 */
async function deleteRefreshToken(token) {
  return RefreshToken.destroy({ where: { token } });
}

/**
 * Elimina todos los refresh tokens de un admin.
 * Usado en logout de todos los dispositivos o al desactivar un admin.
 * @param {number} adminId
 * @returns {Promise<number>} Filas eliminadas
 */
async function deleteAllRefreshTokens(adminId) {
  return RefreshToken.destroy({ where: { admin_id: adminId } });
}

/**
 * Busca un refresh token en la DB.
 * Verifica que exista Y que no haya expirado.
 * @param {string} token
 * @returns {Promise<RefreshToken>}
 * @throws {ApiError} 401 si no existe o está expirado
 */
async function findRefreshToken(token) {
  const record = await RefreshToken.findOne({ where: { token } });

  if (!record) {
    throw ApiError.unauthorized('Refresh token inválido o ya fue revocado.');
  }

  if (new Date() > new Date(record.expira_en)) {
    // Limpiamos el token expirado
    await record.destroy();
    throw ApiError.unauthorized('Refresh token expirado. Iniciá sesión nuevamente.');
  }

  return record;
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokens,
  findRefreshToken,
};
