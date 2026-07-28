'use strict';

const { body } = require('express-validator');

/**
 * auth.validators.js
 *
 * Chains de express-validator para los endpoints de autenticación.
 * Se usan como array de middlewares antes del controller.
 */

/**
 * POST /api/auth/login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Formato de email inválido.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
];

/**
 * POST /api/auth/refresh
 * El refresh token puede venir del body o de la cookie (manejado en el controller).
 * La validación solo aplica si viene por body.
 */
const refreshValidator = [
  body('refreshToken')
    .optional()
    .isString().withMessage('refreshToken debe ser una cadena de texto.')
    .notEmpty().withMessage('refreshToken no puede estar vacío.'),
];

module.exports = {
  loginValidator,
  refreshValidator,
};
