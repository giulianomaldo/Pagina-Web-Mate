'use strict';

const { DataTypes }  = require('sequelize');
const { sequelize }  = require('../config/database');
const bcrypt         = require('bcryptjs');

/**
 * UsuarioAdministrador
 *
 * Usuarios con acceso al panel de administración.
 * Completamente separado de los clientes (si se agregan en el futuro).
 *
 * Roles:
 *   - superadmin → acceso total
 *   - editor     → puede gestionar productos y pedidos, pero NO usuarios admin
 */
const UsuarioAdministrador = sequelize.define('UsuarioAdministrador', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  nombre: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    validate:  {
      notEmpty: { msg: 'El nombre no puede estar vacío.' },
      len:      { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres.' },
    },
  },

  email: {
    type:      DataTypes.STRING(150),
    allowNull: false,
    unique:    { name: 'unique_admin_email', msg: 'Ya existe un administrador con ese email.' },
    validate:  { isEmail: { msg: 'Email inválido.' } },
  },

  password_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },

  rol: {
    type:         DataTypes.ENUM('superadmin', 'editor'),
    allowNull:    false,
    defaultValue: 'editor',
  },

  is_active: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: true,
  },

  ultimo_login: {
    type:      DataTypes.DATE,
    allowNull: true,
    comment:   'Timestamp del último login exitoso.',
  },
}, {
  tableName:   'usuarios_administradores',
  timestamps:  true,
  underscored: true,
  indexes: [
    { fields: ['email'],     unique: true },
    { fields: ['rol']                     },
    { fields: ['is_active']               },
  ],

  hooks: {
    /**
     * Hashea la contraseña antes de crear o actualizar si fue modificada.
     * Usar siempre instance.set('password_hash', rawPassword) en los controllers.
     */
    beforeCreate: async (admin) => {
      if (admin.password_hash) {
        admin.password_hash = await bcrypt.hash(admin.password_hash, 12);
      }
    },

    beforeUpdate: async (admin) => {
      if (admin.changed('password_hash')) {
        admin.password_hash = await bcrypt.hash(admin.password_hash, 12);
      }
    },
  },
});

/**
 * Método de instancia para comparar la contraseña ingresada con el hash.
 * Uso: const valid = await admin.verificarPassword(inputPlain);
 */
UsuarioAdministrador.prototype.verificarPassword = async function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password_hash);
};

/**
 * Método de instancia para serializar sin exponer datos sensibles.
 * Llamar en lugar de toJSON() cuando se devuelve al cliente.
 */
UsuarioAdministrador.prototype.toPublicJSON = function () {
  return {
    id:           this.id,
    nombre:       this.nombre,
    email:        this.email,
    rol:          this.rol,
    is_active:    this.is_active,
    ultimo_login: this.ultimo_login,
    created_at:   this.created_at,
  };
};

module.exports = UsuarioAdministrador;
