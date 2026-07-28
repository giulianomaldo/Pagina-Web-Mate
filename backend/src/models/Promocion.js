'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Promocion
 *
 * Descuentos aplicables al carrito o a productos específicos.
 *
 * Tipos de descuento:
 *   porcentaje  → 10% off
 *   monto_fijo  → $500 off
 *
 * Ámbito de aplicación (aplica_a):
 *   todos      → se aplica a cualquier compra
 *   categoria  → se aplica a productos de una categoría específica
 *   producto   → se aplica solo a los productos en la tabla ProductoPromocion
 *
 * Relaciones:
 *   - BelongsTo UsuarioAdministrador (creado_por)
 *   - BelongsTo Categoria (categoria_id, opcional)
 *   - BelongsToMany Producto (vía ProductoPromocion, solo cuando aplica_a = 'producto')
 */
const Promocion = sequelize.define('Promocion', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  // ── Claves foráneas ──────────────────────────────────────────────
  creado_por: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  true,
    references: { model: 'usuarios_administradores', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'SET NULL',
  },

  categoria_id: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  true,
    references: { model: 'categorias', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'SET NULL',
    comment:    'Solo relevante cuando aplica_a = "categoria".',
  },

  // ── Identificación ───────────────────────────────────────────────
  nombre: {
    type:      DataTypes.STRING(150),
    allowNull: false,
    validate:  {
      notEmpty: { msg: 'El nombre de la promoción no puede estar vacío.' },
    },
  },

  descripcion: {
    type:      DataTypes.TEXT,
    allowNull: true,
    comment:   'Descripción visible para el cliente.',
  },

  // ── Configuración del descuento ──────────────────────────────────
  tipo_descuento: {
    type:      DataTypes.ENUM('porcentaje', 'monto_fijo'),
    allowNull: false,
    validate:  { notNull: { msg: 'El tipo de descuento es obligatorio.' } },
  },

  valor_descuento: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate:  {
      min: { args: [0.01], msg: 'El valor del descuento debe ser mayor a 0.' },
      porcentajeValido(value) {
        if (this.tipo_descuento === 'porcentaje' && parseFloat(value) > 100) {
          throw new Error('El porcentaje de descuento no puede superar 100.');
        }
      },
    },
  },

  compra_minima: {
    type:         DataTypes.DECIMAL(10, 2),
    allowNull:    false,
    defaultValue: 0,
    comment:      'Monto mínimo del carrito para que aplique la promoción.',
    validate:     { min: { args: [0], msg: 'La compra mínima no puede ser negativa.' } },
  },

  // ── Control de uso ───────────────────────────────────────────────
  usos_maximos: {
    type:      DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: null,
    comment:   'null = ilimitado.',
  },

  usos_actuales: {
    type:         DataTypes.INTEGER.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
  },

  // ── Ámbito ───────────────────────────────────────────────────────
  aplica_a: {
    type:         DataTypes.ENUM('todos', 'categoria', 'producto'),
    allowNull:    false,
    defaultValue: 'todos',
  },

  // ── Vigencia ─────────────────────────────────────────────────────
  fecha_inicio: {
    type:      DataTypes.DATE,
    allowNull: false,
    validate:  { notNull: { msg: 'La fecha de inicio es obligatoria.' } },
  },

  fecha_fin: {
    type:      DataTypes.DATE,
    allowNull: false,
    validate:  {
      notNull: { msg: 'La fecha de fin es obligatoria.' },
      fechaFinValida(value) {
        if (new Date(value) <= new Date(this.fecha_inicio)) {
          throw new Error('fecha_fin debe ser posterior a fecha_inicio.');
        }
      },
    },
  },

  is_active: {
    type:         DataTypes.BOOLEAN,
    allowNull:    false,
    defaultValue: true,
  },
}, {
  tableName:   'promociones',
  timestamps:  true,
  underscored: true,
  indexes: [
    { fields: ['is_active', 'fecha_inicio', 'fecha_fin'] },
    { fields: ['aplica_a']                                },
    { fields: ['categoria_id']                            },
    { fields: ['creado_por']                              },
  ],
});

module.exports = Promocion;
