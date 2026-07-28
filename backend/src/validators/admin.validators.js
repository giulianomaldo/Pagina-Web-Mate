'use strict';

const { body, param } = require('express-validator');

/**
 * admin.validators.js
 */

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
  .toInt();

const crearValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 100 }),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Debe ser un email válido.')
    .isLength({ max: 150 }),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres.'),

  body('rol')
    .optional()
    .isIn(['admin', 'superadmin']).withMessage('Rol inválido.'),
];

const actualizarValidator = [
  idParam,
  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Debe ser un email válido.')
    .isLength({ max: 150 }),

  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres.'),

  body('rol')
    .optional()
    .isIn(['admin', 'superadmin']).withMessage('Rol inválido.'),
];

module.exports = {
  idParam: [idParam],
  crearValidator,
  actualizarValidator,
};
