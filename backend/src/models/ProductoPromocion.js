'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * ProductoPromocion — Tabla junction N:M
 *
 * Relaciona Producto ↔ Promocion cuando aplica_a = 'producto'.
 * Permite que una promoción aplique a productos específicos
 * sin importar su categoría.
 */
const ProductoPromocion = sequelize.define('ProductoPromocion', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  producto_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  false,
    references: { model: 'productos',   key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'CASCADE',
  },

  promocion_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  false,
    references: { model: 'promociones', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'CASCADE',
  },
}, {
  tableName:   'producto_promocion',
  timestamps:  false,
  underscored: true,
  indexes: [
    // Evita que el mismo producto esté dos veces en la misma promoción
    {
      unique: true,
      fields: ['producto_id', 'promocion_id'],
      name:   'unique_producto_promocion',
    },
    { fields: ['promocion_id'] },
    { fields: ['producto_id']  },
  ],
});

module.exports = ProductoPromocion;
