'use strict';

const { body, param, query } = require('express-validator');

/**
 * banner.validators.js
 */

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
  .toInt();

const listarValidator = [
  query('posicion')
    .optional()
    .isIn(['hero', 'mid', 'lateral', 'popup']).withMessage('Posición inválida.'),
];

const getOneValidator = [idParam];

const crearValidator = [
  body('titulo')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('El título no puede superar 150 caracteres.'),

  body('subtitulo')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('El subtítulo no puede superar 300 caracteres.'),

  body('link_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('link_url debe ser una URL válida.')
    .isLength({ max: 500 }),

  body('link_label')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('posicion')
    .optional()
    .isIn(['hero', 'mid', 'lateral', 'popup']).withMessage('Posición inválida.'),

  body('orden')
    .optional()
    .isInt({ min: 0 }).toInt(),

  body('fecha_inicio')
    .optional({ nullable: true })
    .isISO8601().toDate(),

  body('fecha_fin')
    .optional({ nullable: true })
    .isISO8601().toDate(),
];

const actualizarValidator = [
  idParam,
  ...crearValidator,
];

const idOnlyValidator = [idParam];

module.exports = {
  listarValidator,
  getOneValidator,
  crearValidator,
  actualizarValidator,
  idOnlyValidator,
};
