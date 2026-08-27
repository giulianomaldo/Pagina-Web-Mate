'use strict';

const { body, param, query } = require('express-validator');

/**
 * producto.validators.js
 *
 * Chains de express-validator para los endpoints del módulo Producto.
 * Se aplican antes de validate middleware en las rutas.
 */

// ── Helpers reutilizables ─────────────────────────────────────────────

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.')
  .toInt();

// ── GET /productos ────────────────────────────────────────────────────

const listarValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un entero mayor a 0.').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100.').toInt(),
  query('precioMin')
    .optional()
    .isFloat({ min: 0 }).withMessage('precioMin debe ser un número positivo.').toFloat(),
  query('precioMax')
    .optional()
    .isFloat({ min: 0 }).withMessage('precioMax debe ser un número positivo.').toFloat(),
  query('orden')
    .optional()
    .isIn(['precio_asc', 'precio_desc', 'nombre_asc', 'nombre_desc', 'recientes', 'stock_asc'])
    .withMessage('Valor de orden inválido.'),
  query('soloStock')
    .optional()
    .isIn(['true', 'false']).withMessage('soloStock debe ser "true" o "false".'),
  query('is_destacado')
    .optional()
    .isIn(['true', 'false']).withMessage('is_destacado debe ser "true" o "false".'),
  query('is_nuevo')
    .optional()
    .isIn(['true', 'false']).withMessage('is_nuevo debe ser "true" o "false".'),
];

// ── GET /productos/:id ────────────────────────────────────────────────

const getOneValidator = [idParam];

// ── POST /productos ───────────────────────────────────────────────────

const crearValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 200 }).withMessage('El nombre debe tener entre 2 y 200 caracteres.'),

  body('categoria_id')
    .notEmpty().withMessage('La categoría es obligatoria.')
    .isInt({ min: 1 }).withMessage('categoria_id debe ser un entero positivo.').toInt(),

  body('marca_id')
    .optional({ nullable: true })
    .customSanitizer(v => (v === '' || v === undefined || v === null) ? undefined : v)
    .isInt({ min: 1 }).withMessage('marca_id debe ser un entero positivo.').toInt(),

  body('proveedor_id')
    .optional({ nullable: true })
    .customSanitizer(v => (v === '' || v === undefined || v === null) ? undefined : v)
    .isInt({ min: 1 }).withMessage('proveedor_id debe ser un entero positivo.').toInt(),

  body('precio')
    .notEmpty().withMessage('El precio es obligatorio.')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0.').toFloat(),

  body('precio_costo')
    .optional({ nullable: true })
    .customSanitizer(v => (v === '' || v === undefined || v === null) ? undefined : v)
    .isFloat({ min: 0 }).withMessage('El precio de costo debe ser mayor o igual a 0.').toFloat(),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo.').toInt(),

  body('stock_minimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un entero no negativo.').toInt(),

  body('tipo')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('tipo no puede superar 100 caracteres.'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La descripción no puede superar 5000 caracteres.'),

  body('peso_gr')
    .optional({ nullable: true })
    .customSanitizer(v => (v === '' || v === undefined || v === null) ? undefined : v)
    .isInt({ min: 0 }).withMessage('peso_gr debe ser un entero no negativo.').toInt(),

  body('is_destacado')
    .optional()
    .isBoolean().withMessage('is_destacado debe ser un booleano.').toBoolean(),

  body('is_nuevo')
    .optional()
    .isBoolean().withMessage('is_nuevo debe ser un booleano.').toBoolean(),

  body('is_mas_vendido')
    .optional()
    .isBoolean().withMessage('is_mas_vendido debe ser un booleano.').toBoolean(),
];

// ── PUT /productos/:id ────────────────────────────────────────────────
// Mismas reglas que crear pero todos los campos son opcionales (PATCH semántico via PUT)

const actualizarValidator = [
  idParam,

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('El nombre debe tener entre 2 y 200 caracteres.'),

  body('categoria_id')
    .optional()
    .isInt({ min: 1 }).withMessage('categoria_id debe ser un entero positivo.').toInt(),

  body('marca_id')
    .optional()
    .isInt({ min: 1 }).withMessage('marca_id debe ser un entero positivo.').toInt(),

  body('proveedor_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('proveedor_id debe ser un entero positivo.').toInt(),

  body('precio')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0.').toFloat(),

  body('precio_costo')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('El precio de costo debe ser mayor o igual a 0.').toFloat(),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo.').toInt(),

  body('stock_minimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un entero no negativo.').toInt(),

  body('tipo')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('tipo no puede superar 100 caracteres.'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('La descripción no puede superar 5000 caracteres.'),

  body('peso_gr')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('peso_gr debe ser un entero no negativo.').toInt(),
];

// ── PATCH /productos/:id/stock ────────────────────────────────────────

const stockValidator = [
  idParam,
  body('stock')
    .notEmpty().withMessage('El stock es obligatorio.')
    .isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo.').toInt(),
];

// ── PATCH /productos/:id/precio ───────────────────────────────────────

const precioValidator = [
  idParam,
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio.')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0.').toFloat(),
];

// ── Validators de solo :id (activar, desactivar, destacado, nuevo, mas-vendido) ──

const idOnlyValidator = [idParam];

module.exports = {
  listarValidator,
  getOneValidator,
  crearValidator,
  actualizarValidator,
  stockValidator,
  precioValidator,
  idOnlyValidator,
};
