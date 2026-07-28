'use strict';

const { body, param, query } = require('express-validator');

/**
 * categoria.validators.js
 */

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
  .toInt();

const listarValidator = [
  query('includeInactive')
    .optional()
    .isIn(['true', 'false']).withMessage('includeInactive debe ser "true" o "false".'),
  query('soloPrincipales')
    .optional()
    .isIn(['true', 'false']).withMessage('soloPrincipales debe ser "true" o "false".'),
  query('parent_id')
    .optional()
    .isInt({ min: 1 }).withMessage('parent_id debe ser un entero positivo.').toInt(),
];

const getOneValidator = [idParam];

const crearValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 80 }).withMessage('El nombre debe tener entre 2 y 80 caracteres.'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La descripción no puede superar 5000 caracteres.'),

  body('emoji')
    .optional()
    .trim()
    .isLength({ max: 10 }).withMessage('El emoji no puede superar 10 caracteres.'),

  body('orden')
    .optional()
    .isInt({ min: 0 }).withMessage('El orden debe ser un número entero no negativo.').toInt(),

  body('parent_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('parent_id debe ser un entero positivo.').toInt(),
];

const actualizarValidator = [
  idParam,
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('El nombre debe tener entre 2 y 80 caracteres.'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La descripción no puede superar 5000 caracteres.'),

  body('emoji')
    .optional()
    .trim()
    .isLength({ max: 10 }).withMessage('El emoji no puede superar 10 caracteres.'),

  body('orden')
    .optional()
    .isInt({ min: 0 }).withMessage('El orden debe ser un número entero no negativo.').toInt(),

  body('parent_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('parent_id debe ser un entero positivo.').toInt(),
];

const idOnlyValidator = [idParam];

module.exports = {
  listarValidator,
  getOneValidator,
  crearValidator,
  actualizarValidator,
  idOnlyValidator,
};
