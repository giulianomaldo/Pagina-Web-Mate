'use strict';

const ApiError = require('../utils/ApiError');
const { server } = require('../config/env');

/**
 * Middleware de manejo global de errores (siempre al final de app.js).
 *
 * Captura:
 *   - ApiError (operacionales): devuelve el statusCode y mensaje definido
 *   - Errores de Sequelize: los normaliza a respuestas legibles
 *   - Errores inesperados (bugs): devuelve 500 y loguea el stack
 *
 * @param {Error}                    err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  // ── 1. ApiError (errores operacionales lanzados intencionalmente) ──
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
    });
  }

  // ── 2. Errores de Sequelize ────────────────────────────────────────

  // Violación de clave única (email duplicado, slug duplicado, etc.)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'campo';
    return res.status(409).json({
      success: false,
      message: `El valor del campo '${field}' ya está en uso.`,
    });
  }

  // Error de validación de Sequelize (NOT NULL, tipo incorrecto, etc.)
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación en base de datos.',
      errors: messages,
    });
  }

  // FK constraint (intentar eliminar un registro referenciado)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'No se puede eliminar: el registro está referenciado por otros datos.',
    });
  }

  // Error de conexión a la DB
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'No se pudo conectar a la base de datos.',
    });
  }

  // ── 3. Errores de JWT ──────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token inválido.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expirado.' });
  }

  // ── 4. Error genérico / inesperado (bug) ──────────────────────────
  console.error('💥  [Error no controlado]', err);

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.',
    // Solo exponer el stack en desarrollo
    ...(server.isDev && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;
