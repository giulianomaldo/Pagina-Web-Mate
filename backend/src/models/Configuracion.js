'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Configuracion
 *
 * Tabla de clave-valor para configuración global del sitio.
 * Permite al admin editar datos de contacto (WhatsApp, horarios, etc.)
 * desde el panel sin tocar código.
 *
 * Claves predefinidas:
 *   whatsapp_numero    → número de WhatsApp (sin +)
 *   whatsapp_mensaje   → mensaje default al abrir WA
 *   ubicacion          → dirección / ciudad
 *   horario_semana     → ej: "Lun–Vie: 9:00 a 18:00"
 *   horario_sabado     → ej: "Sáb: 9:00 a 13:00"
 *   email              → email de contacto
 *   envios_descripcion → ej: "Envíos a todo el país"
 */
const Configuracion = sequelize.define('Configuracion', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  clave: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    { name: 'unique_config_clave', msg: 'La clave ya existe.' },
    validate:  {
      notEmpty: { msg: 'La clave no puede estar vacía.' },
      is: {
        args: /^[a-z0-9_]+$/,
        msg: 'La clave solo puede contener letras minúsculas, números y guiones bajos.',
      },
    },
  },

  valor: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },

  descripcion: {
    type:      DataTypes.STRING(255),
    allowNull: true,
    comment:   'Descripción interna para el admin.',
  },
}, {
  tableName:   'configuraciones',
  timestamps:  true,
  underscored: true,
  indexes: [
    { fields: ['clave'], unique: true },
  ],
});

module.exports = Configuracion;
