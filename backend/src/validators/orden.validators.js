'use strict';

const { body, param, query } = require('express-validator');

/**
 * orden.validators.js
 */

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
  .toInt();

const listarValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
];

const crearValidator = [
  body('customer_name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres.'),
  
  body('customer_phone')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio.')
    .isLength({ max: 30 }).withMessage('Máximo 30 caracteres.'),
  
  body('customer_email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Email inválido.'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Máximo 1000 caracteres.'),

  body('items')
    .isArray({ min: 1 }).withMessage('El carrito no puede estar vacío.'),
  
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido.'),
  
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1.'),
];

const statusValidator = [
  idParam,
  body('status')
    .notEmpty().withMessage('El estado es obligatorio.')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Estado no válido.'),
];

module.exports = {
  idParam: [idParam],
  listarValidator,
  crearValidator,
  statusValidator,
};
