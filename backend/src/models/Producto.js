'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Producto
 *
 * Entidad central del catálogo. Pertenece a:
 *   - Categoria (obligatorio)
 *   - Marca     (obligatorio)
 *   - Proveedor (opcional — dato interno)
 *
 * Tiene relación N:M con Promocion (vía ProductoPromocion).
 */
const Producto = sequelize.define('Producto', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  // ── Claves foráneas ──────────────────────────────────────────────
  categoria_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  false,
    references: { model: 'categorias', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'RESTRICT', // No eliminar categoría con productos
  },

  marca_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  true,
    references: { model: 'marcas', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'SET NULL',
  },

  proveedor_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  true,
    references: { model: 'proveedores', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'SET NULL', // Si se elimina el proveedor, el producto queda sin proveedor
  },

  // ── Identificación ───────────────────────────────────────────────
  nombre: {
    type:      DataTypes.STRING(200),
    allowNull: false,
    validate:  {
      notEmpty: { msg: 'El nombre no puede estar vacío.' },
      len:      { args: [2, 200], msg: 'El nombre debe tener entre 2 y 200 caracteres.' },
    },
  },

  slug: {
    type:      DataTypes.STRING(220),
    allowNull: false,
    unique:    { name: 'unique_producto_slug', msg: 'El slug ya existe.' },
    validate:  {
      is: {
        args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        msg: 'El slug solo puede contener letras minúsculas, números y guiones.',
      },
    },
  },

  tipo: {
    type:      DataTypes.STRING(100),
    allowNull: true,
    comment:   'Subtipo del producto. Ej: "Mate de calabaza", "Bombilla de alpaca".',
  },

  // ── Contenido ────────────────────────────────────────────────────
  descripcion: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  // ── Precios ──────────────────────────────────────────────────────
  precio: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate:  { min: { args: [0], msg: 'El precio no puede ser negativo.' } },
  },

  precio_costo: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment:   'Precio de costo interno. Solo visible para admins.',
    validate:  { min: { args: [0], msg: 'El precio de costo no puede ser negativo.' } },
  },

  // ── Stock ────────────────────────────────────────────────────────
  stock: {
    type:         DataTypes.INTEGER.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
    validate:     { min: { args: [0], msg: 'El stock no puede ser negativo.' } },
  },

  stock_minimo: {
    type:         DataTypes.INTEGER.UNSIGNED,
    allowNull:    false,
    defaultValue: 5,
    comment:      'Umbral para alertas de stock bajo.',
  },

  // ── Imágenes ─────────────────────────────────────────────────────
  imagen_url: {
    type:      DataTypes.STRING(500),
    allowNull: true,
    validate:  { isUrl: { msg: 'imagen_url debe ser una URL válida.' } },
  },

  imagen_public_id: {
    type:      DataTypes.STRING(255),
    allowNull: true,
    comment:   'ID de Cloudinary para poder eliminar la imagen principal.',
  },

  imagenes: {
    type:         DataTypes.JSON,
    allowNull:    true,
    defaultValue: [],
    comment:      'Array de objetos { url, public_id } para la galería de imágenes.',
  },

  // ── Dimensiones / Logística ──────────────────────────────────────
  peso_gr: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment:   'Peso del producto en gramos. Útil para calcular envíos.',
  },

  // ── Flags de vitrina ──────────────────────────────────────────────
  is_destacado: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
    comment:      'Aparece en la sección "Destacados" del Home.',
  },

  is_nuevo: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
  },

  is_mas_vendido: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: false,
  },

  is_active: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: true,
    comment:      'Soft delete — los productos inactivos no aparecen en la tienda.',
  },
}, {
  tableName:   'productos',
  timestamps:  true,
  underscored: true,
  indexes: [
    { fields: ['slug'],                         unique: true               },
    { fields: ['categoria_id']                                             },
    { fields: ['marca_id']                                                 },
    { fields: ['proveedor_id']                                             },
    { fields: ['is_active', 'is_destacado']                               },
    { fields: ['is_active', 'categoria_id']                               },
    { fields: ['precio']                                                   },
    { fields: ['stock']                                                    },
    // Índice de texto (FULLTEXT solo en MySQL; en SQLite se usa LIKE)
    { fields: ['nombre'] },
  ],
});

module.exports = Producto;
