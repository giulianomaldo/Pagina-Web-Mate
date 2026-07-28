'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Banner
 *
 * Imágenes promocionales que aparecen en distintas posiciones del sitio.
 * Soporta programación por fechas (starts_at / ends_at).
 *
 * Posiciones disponibles:
 *   hero     → carrusel principal del Home
 *   mid      → banner de sección media del Home
 *   lateral  → sidebar del catálogo
 *   popup    → modal de bienvenida o promoción especial
 */
const Banner = sequelize.define('Banner', {
  id: {
    type:          DataTypes.INTEGER.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },

  // ── Clave foránea ─────────────────────────────────────────────────
  creado_por: {
    type:       DataTypes.INTEGER.UNSIGNED,
    allowNull:  true,
    references: { model: 'usuarios_administradores', key: 'id' },
    onUpdate:   'CASCADE',
    onDelete:   'SET NULL',
    comment:    'Admin que creó el banner.',
  },

  // ── Contenido ────────────────────────────────────────────────────
  titulo: {
    type:      DataTypes.STRING(150),
    allowNull: true,
  },

  subtitulo: {
    type:      DataTypes.STRING(300),
    allowNull: true,
  },

  imagen_url: {
    type:      DataTypes.STRING(500),
    allowNull: false,
    validate:  { isUrl: { msg: 'imagen_url debe ser una URL válida.' } },
  },

  imagen_public_id: {
    type:      DataTypes.STRING(255),
    allowNull: true,
    comment:   'ID de Cloudinary para poder eliminar la imagen.',
  },

  // ── CTA (Call to Action) ──────────────────────────────────────────
  link_url: {
    type:      DataTypes.STRING(500),
    allowNull: true,
    comment:   'URL de destino al hacer clic en el banner.',
  },

  link_label: {
    type:      DataTypes.STRING(100),
    allowNull: true,
    comment:   'Texto del botón CTA. Ej: "Ver oferta", "Ir al catálogo".',
  },

  // ── Configuración de display ──────────────────────────────────────
  posicion: {
    type:         DataTypes.ENUM('hero', 'mid', 'lateral', 'popup'),
    allowNull:    false,
    defaultValue: 'hero',
  },

  orden: {
    type:         DataTypes.SMALLINT.UNSIGNED,
    allowNull:    false,
    defaultValue: 0,
    comment:      'Orden dentro de la misma posición (para carruseles).',
  },

  // ── Programación temporal ─────────────────────────────────────────
  fecha_inicio: {
    type:      DataTypes.DATE,
    allowNull: true,
    comment:   'Si es null, el banner está siempre activo (si is_active = true).',
  },

  fecha_fin: {
    type:      DataTypes.DATE,
    allowNull: true,
    validate:  {
      fechaFinValida(value) {
        if (value && this.fecha_inicio && new Date(value) <= new Date(this.fecha_inicio)) {
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
  tableName:   'banners',
  timestamps:  true,
  underscored: true,
  indexes: [
    { fields: ['posicion', 'is_active', 'orden'] },
    { fields: ['fecha_inicio', 'fecha_fin']       },
    { fields: ['creado_por']                      },
  ],
});

module.exports = Banner;
