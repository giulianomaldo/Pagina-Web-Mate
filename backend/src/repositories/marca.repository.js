'use strict';

const { Op } = require('sequelize');
const { Marca } = require('../models');

/**
 * marca.repository.js
 *
 * Capa de acceso a datos para Marca.
 */

/**
 * Lista todas las marcas.
 * @param {object} query - Parámetros de búsqueda opcionales
 * @param {object} opts  - { isAdmin }
 * @returns {Promise<Marca[]>}
 */
async function findAll(query = {}, opts = {}) {
  const where = {};

  if (!opts.isAdmin || query.includeInactive !== 'true') {
    where.is_active = true;
  }

  if (query.busqueda) {
    where.nombre = { [Op.like]: `%${query.busqueda}%` };
  }

  return Marca.findAll({
    where,
    order: [['nombre', 'ASC']],
  });
}

/**
 * @param {number} id
 * @param {object} opts - { isAdmin }
 * @returns {Promise<Marca|null>}
 */
async function findById(id, opts = {}) {
  return Marca.findByPk(id);
}

/**
 * @param {string} slug
 * @param {object} opts - { isAdmin }
 * @returns {Promise<Marca|null>}
 */
async function findBySlug(slug, opts = {}) {
  const where = { slug };
  if (!opts.isAdmin) where.is_active = true;

  return Marca.findOne({ where });
}

/**
 * Verifica si un slug ya está en uso (excluye el id actual en updates).
 * @param {string}  slug
 * @param {number}  [excludeId]
 * @returns {Promise<boolean>}
 */
async function slugExists(slug, excludeId = null) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const count = await Marca.count({ where });
  return count > 0;
}

/**
 * @param {object} data
 * @returns {Promise<Marca>}
 */
async function create(data) {
  return Marca.create(data);
}

/**
 * @param {Marca} marca
 * @param {object} data
 * @returns {Promise<Marca>}
 */
async function update(marca, data) {
  return marca.update(data);
}

/**
 * @param {Marca} marca
 * @param {boolean} value
 */
async function setActive(marca, value) {
  return marca.update({ is_active: value });
}

/**
 * @param {Marca} marca
 */
async function destroy(marca) {
  return marca.destroy();
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  slugExists,
  create,
  update,
  setActive,
  destroy,
};
