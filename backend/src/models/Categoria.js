'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Categoria
 *
 * Soporta jerarquía de un nivel (parent_id auto-referencia).
 * Ejemplo: "Yerbas" > "Yerbas orgánicas"
 */
const Categoria = sequelize.define('Categoria', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  nombre: {
    type:      DataTypes.STRING(80),
    allowNull: false,
    validate:  {
      notEmpty: { msg: 'El nombre no puede estar vacío.' },
      len:      { args: [2, 80], msg: 'El nombre debe tener entre 2 y 80 caracteres.' },
    },
  },

  slug: {
    type:      DataTypes.STRING(80),
    allowNull: false,
    unique:    { name: 'unique_categoria_slug', msg: 'El slug ya existe.' },
    validate:  {
      is: {
        args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        msg: 'El slug solo puede contener letras minúsculas, números y guiones.',
      },
    },
  },

  descripcion: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  emoji: {
    type:      DataTypes.STRING(10),
    allowNull: true,
  },

  imagen_url: {
    type:      DataTypes.STRING(500),
    allowNull: true,
    validate:  { isUrl: { msg: 'imagen_url debe ser una URL válida.' } },
  },

  imagen_public_id: {
    type:      DataTypes.STRING(255),
    allowNull: true,
    comment:   'ID de Cloudinary para poder eliminar la imagen.',
  },

  orden: {
    type:         DataTypes.SMALLINT.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
    comment:      'Orden de aparición en el catálogo.',
  },

  parent_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  true,
    defaultValue: null,
    references: { model: 'categorias', key: 'id' },
    onDelete:   'SET NULL',
    comment:    'Auto-referencia para subcategorías.',
  },

  is_active: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: true,
  },
}, {
  tableName:  'categorias',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['slug'],      unique: true },
    { fields: ['parent_id']               },
    { fields: ['is_active']               },
    { fields: ['orden']                   },
  ],
});

module.exports = Categoria;
