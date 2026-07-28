'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Marca
 *
 * Fabricante o marca comercial del producto.
 * Un producto pertenece a una única marca.
 */
const Marca = sequelize.define('Marca', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  nombre: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    { name: 'unique_marca_nombre', msg: 'Ya existe una marca con ese nombre.' },
    validate:  {
      notEmpty: { msg: 'El nombre no puede estar vacío.' },
      len:      { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres.' },
    },
  },

  slug: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    { name: 'unique_marca_slug', msg: 'El slug ya existe.' },
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

  logo_url: {
    type:      DataTypes.STRING(500),
    allowNull: true,
    validate:  { isUrl: { msg: 'logo_url debe ser una URL válida.' } },
  },

  logo_public_id: {
    type:      DataTypes.STRING(255),
    allowNull: true,
    comment:   'ID de Cloudinary para poder eliminar el logo.',
  },

  pais_origen: {
    type:      DataTypes.STRING(100),
    allowNull: true,
  },

  sitio_web: {
    type:      DataTypes.STRING(300),
    allowNull: true,
    validate:  { isUrl: { msg: 'sitio_web debe ser una URL válida.' } },
  },

  is_active: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: true,
  },
}, {
  tableName:   'marcas',
  timestamps:  true,
  underscored: true,
  indexes: [
    { fields: ['slug'],      unique: true },
    { fields: ['is_active']               },
  ],
});

module.exports = Marca;
