'use strict';

/**
 * models/index.js
 *
 * Punto central de importación de modelos y declaración de asociaciones.
 * SIEMPRE importar los modelos desde aquí, nunca directamente desde su archivo.
 *
 * Orden de importación:
 *   1. Modelos sin dependencias (Categoria, Marca, Proveedor, UsuarioAdministrador)
 *   2. Modelos con FK simples (Producto, Banner, Promocion, RefreshToken)
 *   3. Tabla junction (ProductoPromocion)
 */

// ── 1. Modelos base ───────────────────────────────────────────────────
const Categoria            = require('./Categoria');
const Marca                = require('./Marca');
const Proveedor            = require('./Proveedor');
const UsuarioAdministrador = require('./UsuarioAdministrador');
const Configuracion        = require('./Configuracion');

// ── 2. Modelos dependientes ───────────────────────────────────────────
const Producto             = require('./Producto');
const Banner               = require('./Banner');
const Promocion            = require('./Promocion');
const RefreshToken         = require('./RefreshToken');

// ── 3. Tabla junction ─────────────────────────────────────────────────
const ProductoPromocion    = require('./ProductoPromocion');

// ═══════════════════════════════════════════════════════════════════════
// ASOCIACIONES
// ═══════════════════════════════════════════════════════════════════════

// ── Categoria ─────────────────────────────────────────────────────────

// Auto-referencia: una categoría puede tener una categoría padre
Categoria.hasMany(Categoria, {
  as:         'subcategorias',
  foreignKey: 'parent_id',
  onDelete:   'SET NULL',
});
Categoria.belongsTo(Categoria, {
  as:         'padre',
  foreignKey: 'parent_id',
});

// Una categoría tiene muchos productos
Categoria.hasMany(Producto, {
  as:         'productos',
  foreignKey: 'categoria_id',
  onDelete:   'RESTRICT',
});
Producto.belongsTo(Categoria, {
  as:         'categoria',
  foreignKey: 'categoria_id',
});

// Una categoría puede estar en muchas promociones
Categoria.hasMany(Promocion, {
  as:         'promociones',
  foreignKey: 'categoria_id',
  onDelete:   'SET NULL',
});
Promocion.belongsTo(Categoria, {
  as:         'categoria',
  foreignKey: 'categoria_id',
});

// ── Marca ─────────────────────────────────────────────────────────────

// Una marca tiene muchos productos
Marca.hasMany(Producto, {
  as:         'productos',
  foreignKey: 'marca_id',
  onDelete:   'RESTRICT',
});
Producto.belongsTo(Marca, {
  as:         'marca',
  foreignKey: 'marca_id',
});

// ── Proveedor ─────────────────────────────────────────────────────────

// Un proveedor puede abastecer muchos productos
Proveedor.hasMany(Producto, {
  as:         'productos',
  foreignKey: 'proveedor_id',
  onDelete:   'SET NULL',
});
Producto.belongsTo(Proveedor, {
  as:         'proveedor',
  foreignKey: 'proveedor_id',
});

// ── UsuarioAdministrador ──────────────────────────────────────────────

// Un admin crea muchos banners
UsuarioAdministrador.hasMany(Banner, {
  as:         'banners',
  foreignKey: 'creado_por',
  onDelete:   'SET NULL',
});
Banner.belongsTo(UsuarioAdministrador, {
  as:         'autor',
  foreignKey: 'creado_por',
});

// Un admin crea muchas promociones
UsuarioAdministrador.hasMany(Promocion, {
  as:         'promociones',
  foreignKey: 'creado_por',
  onDelete:   'SET NULL',
});
Promocion.belongsTo(UsuarioAdministrador, {
  as:         'autor',
  foreignKey: 'creado_por',
});

// Un admin tiene muchos refresh tokens (multi-dispositivo)
UsuarioAdministrador.hasMany(RefreshToken, {
  as:         'refreshTokens',
  foreignKey: 'admin_id',
  onDelete:   'CASCADE',
});
RefreshToken.belongsTo(UsuarioAdministrador, {
  as:         'admin',
  foreignKey: 'admin_id',
});

// ── Producto ↔ Promocion  (N:M) ───────────────────────────────────────

// Un producto puede estar en muchas promociones
// Una promoción puede aplicar a muchos productos
Producto.belongsToMany(Promocion, {
  through:    ProductoPromocion,
  as:         'promociones',
  foreignKey: 'producto_id',
  otherKey:   'promocion_id',
});
Promocion.belongsToMany(Producto, {
  through:    ProductoPromocion,
  as:         'productos',
  foreignKey: 'promocion_id',
  otherKey:   'producto_id',
});

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIONES
// Exportar todos los modelos para acceso centralizado:
//   const { Producto, Categoria } = require('../models');
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
  Categoria,
  Configuracion,
  Marca,
  Proveedor,
  UsuarioAdministrador,
  Producto,
  Banner,
  Promocion,
  RefreshToken,
  ProductoPromocion,
};
