'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * RefreshToken
 *
 * Persiste los refresh tokens de los admins para permitir
 * invalidación real en logout (a diferencia de solo confiar en la expiración del JWT).
 * Un admin puede tener múltiples refresh tokens activos (multi-dispositivo).
 */
const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  admin_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  false,
    references: { model: 'usuarios_administradores', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'CASCADE', // Al eliminar el admin, se eliminan sus tokens
  },

  token: {
    type:      DataTypes.TEXT,
    allowNull: false,
    comment:   'JWT refresh token completo (firmado).',
  },

  expira_en: {
    type:      DataTypes.DATE,
    allowNull: false,
    comment:   'Fecha de expiración del token. Usada para limpieza programada.',
  },

  ip_address: {
    type:      DataTypes.STRING(45), // IPv6 puede tener hasta 45 chars
    allowNull: true,
    comment:   'IP desde donde se generó el token.',
  },

  user_agent: {
    type:      DataTypes.STRING(500),
    allowNull: true,
    comment:   'User-Agent del navegador/dispositivo.',
  },
}, {
  tableName:   'refresh_tokens',
  timestamps:  true,
  updatedAt:   false, // Solo necesitamos created_at
  underscored: true,
  indexes: [
    { fields: ['admin_id']   },
    { fields: ['expira_en']  }, // Para limpiar tokens expirados con un cron
  ],
});

module.exports = RefreshToken;
