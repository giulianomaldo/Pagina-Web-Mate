'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Proveedor
 *
 * Empresa o persona física que abastece los productos.
 * Dato interno — no expuesto en la API pública.
 * Un proveedor puede abastecer múltiples productos.
 */
const Proveedor = sequelize.define('Proveedor', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  nombre: {
    type:      DataTypes.STRING(150),
    allowNull: false,
    validate:  {
      notEmpty: { msg: 'El nombre del proveedor no puede estar vacío.' },
    },
  },

  nombre_contacto: {
    type:      DataTypes.STRING(100),
    allowNull: true,
    comment:   'Persona de contacto dentro del proveedor.',
  },

  email: {
    type:      DataTypes.STRING(150),
    allowNull: true,
    unique:    { name: 'unique_proveedor_email', msg: 'Ya existe un proveedor con ese email.' },
    validate:  { isEmail: { msg: 'Email inválido.' } },
  },

  telefono: {
    type:      DataTypes.STRING(30),
    allowNull: true,
  },

  direccion: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  ciudad: {
    type:      DataTypes.STRING(100),
    allowNull: true,
  },

  provincia: {
    type:      DataTypes.STRING(100),
    allowNull: true,
  },

  cuit: {
    type:      DataTypes.STRING(20),
    allowNull: true,
    unique:    { name: 'unique_proveedor_cuit', msg: 'Ya existe un proveedor con ese CUIT.' },
    comment:   'CUIT para facturación.',
  },

  condicion_iva: {
    type:      DataTypes.ENUM('responsable_inscripto', 'monotributo', 'exento', 'consumidor_final'),
    allowNull: true,
  },

  notas: {
    type:      DataTypes.TEXT,
    allowNull: true,
    comment:   'Notas internas sobre el proveedor (plazos de entrega, condiciones, etc.).',
  },

  is_active: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: true,
  },
}, {
  tableName:   'proveedores',
  timestamps:  true,
  underscored: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['cuit']  },
    { fields: ['is_active']                                                                         },
    { fields: ['provincia']                                                                         },
  ],
});

module.exports = Proveedor;
