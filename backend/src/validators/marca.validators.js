'use strict';

const { body, param, query } = require('express-validator');

/**
 * marca.validators.js
 */

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
  .toInt();

const listarValidator = [
  query('includeInactive')
    .optional()
    .isIn(['true', 'false']).withMessage('includeInactive debe ser "true" o "false".'),
];

const getOneValidator = [idParam];

const crearValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La descripción no puede superar 5000 caracteres.'),

  body('pais_origen')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El país de origen no puede superar 100 caracteres.'),

  body('sitio_web')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('El sitio web debe ser una URL válida.')
    .isLength({ max: 300 }).withMessage('El sitio web no puede superar 300 caracteres.'),
];

const actualizarValidator = [
  idParam,
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La descripción no puede superar 5000 caracteres.'),

  body('pais_origen')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El país de origen no puede superar 100 caracteres.'),

  body('sitio_web')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('El sitio web debe ser una URL válida.')
    .isLength({ max: 300 }).withMessage('El sitio web no puede superar 300 caracteres.'),
];

const idOnlyValidator = [idParam];

module.exports = {
  listarValidator,
  getOneValidator,
  crearValidator,
  actualizarValidator,
  idOnlyValidator,
};
