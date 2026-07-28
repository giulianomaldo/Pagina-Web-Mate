'use strict';

const { Op } = require('sequelize');
const { Banner, UsuarioAdministrador } = require('../models');

/**
 * banner.repository.js
 */

async function findAll(opts = {}) {
  const where = {};

  if (!opts.isAdmin) {
    where.is_active = true;
    
    // Si no es admin, solo devuelve banners dentro de su vigencia
    const now = new Date();
    where[Op.and] = [
      {
        [Op.or]: [
          { fecha_inicio: null },
          { fecha_inicio: { [Op.lte]: now } },
        ]
      },
      {
        [Op.or]: [
          { fecha_fin: null },
          { fecha_fin: { [Op.gte]: now } },
        ]
      }
    ];
  }

  // Si se pasa posición por opts (ej: para frontend pedir solo hero)
  if (opts.posicion) {
    where.posicion = opts.posicion;
  }

  return Banner.findAll({
    where,
    order: [['posicion', 'ASC'], ['orden', 'ASC']],
    include: opts.isAdmin ? [
      { model: UsuarioAdministrador, as: 'autor', attributes: ['nombre', 'email'] }
    ] : [],
  });
}

async function findById(id) {
  return Banner.findByPk(id);
}

async function create(data) {
  return Banner.create(data);
}

async function update(banner, data) {
  return banner.update(data);
}

async function setActive(banner, value) {
  return banner.update({ is_active: value });
}

async function destroy(banner) {
  return banner.destroy();
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  setActive,
  destroy,
};
