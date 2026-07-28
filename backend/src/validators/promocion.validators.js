'use strict';

const { body, param, query } = require('express-validator');

/**
 * promocion.validators.js
 */

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
  .toInt();

const listarValidator = [
  query('activas').optional().isIn(['true', 'false']),
];

const crearValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 150 }).withMessage('Máximo 150 caracteres.'),
  
  body('descripcion')
    .optional()
    .trim(),

  body('tipo_descuento')
    .isIn(['porcentaje', 'monto_fijo']).withMessage('Tipo de descuento inválido.'),

  body('valor_descuento')
    .isFloat({ min: 0.01 }).withMessage('El descuento debe ser mayor a 0.')
    .toFloat(),

  body('compra_minima')
    .optional()
    .isFloat({ min: 0 }).toFloat(),

  body('usos_maximos')
    .optional({ nullable: true })
    .isInt({ min: 1 }).toInt(),

  body('aplica_a')
    .isIn(['todos', 'categoria', 'producto']).withMessage('Ámbito inválido.'),
  
  body('categoria_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).toInt(),
  
  body('productos_ids')
    .optional()
    .isArray().withMessage('Debe ser un arreglo de IDs.'),
  body('productos_ids.*')
    .optional()
    .isInt({ min: 1 }).toInt(),

  body('fecha_inicio')
    .isISO8601().toDate().withMessage('Fecha de inicio inválida.'),

  body('fecha_fin')
    .isISO8601().toDate().withMessage('Fecha de fin inválida.'),
];

const actualizarValidator = [
  idParam,
  ...crearValidator,
];

const validarCuponValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El código del cupón es obligatorio.'),
  body('items')
    .isArray({ min: 1 }).withMessage('El carrito no puede estar vacío.'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido.'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1.'),
  body('items.*.price')
    .isFloat({ min: 0 }).withMessage('El precio del producto es inválido.'),
];

module.exports = {
  idParam: [idParam],
  listarValidator,
  crearValidator,
  actualizarValidator,
  validarCuponValidator,
};
