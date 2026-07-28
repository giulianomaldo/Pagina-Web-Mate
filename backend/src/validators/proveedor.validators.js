'use strict';

const { body, param, query } = require('express-validator');

/**
 * proveedor.validators.js
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

  body('cuit')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El CUIT/RUT no puede superar 20 caracteres.'),

  body('condicion_iva')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('La condición de IVA no puede superar 50 caracteres.'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('El email debe tener un formato válido.')
    .isLength({ max: 150 }).withMessage('El email no puede superar 150 caracteres.'),

  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('El teléfono no puede superar 50 caracteres.'),

  body('direccion')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('La dirección no puede superar 255 caracteres.'),

  body('notas_internas')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Las notas internas no pueden superar 1000 caracteres.'),
];

const actualizarValidator = [
  idParam,
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),

  body('cuit')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El CUIT/RUT no puede superar 20 caracteres.'),

  body('condicion_iva')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('La condición de IVA no puede superar 50 caracteres.'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('El email debe tener un formato válido.')
    .isLength({ max: 150 }).withMessage('El email no puede superar 150 caracteres.'),

  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('El teléfono no puede superar 50 caracteres.'),

  body('direccion')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('La dirección no puede superar 255 caracteres.'),

  body('notas_internas')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Las notas internas no pueden superar 1000 caracteres.'),
];

const idOnlyValidator = [idParam];

module.exports = {
  listarValidator,
  getOneValidator,
  crearValidator,
  actualizarValidator,
  idOnlyValidator,
};
