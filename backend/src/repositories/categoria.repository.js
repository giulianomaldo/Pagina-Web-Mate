'use strict';

const { Op } = require('sequelize');
const { Categoria } = require('../models');

/**
 * categoria.repository.js
 *
 * Capa de acceso a datos para Categoria.
 */

/**
 * Lista todas las categorías.
 * @param {object} query - Parámetros de búsqueda opcionales
 * @param {object} opts  - { isAdmin }
 * @returns {Promise<Categoria[]>}
 */
async function findAll(query = {}, opts = {}) {
  const where = {};

  if (!opts.isAdmin || query.includeInactive !== 'true') {
    where.is_active = true;
  }

  // Filtrar solo categorías principales o subcategorías
  if (query.soloPrincipales === 'true') {
    where.parent_id = null;
  } else if (query.parent_id) {
    where.parent_id = query.parent_id;
  }

  if (query.busqueda) {
    where.nombre = { [Op.like]: `%${query.busqueda}%` };
  }

  return Categoria.findAll({
    where,
    order: [['orden', 'ASC'], ['nombre', 'ASC']],
    include: [
      {
        model: Categoria,
        as: 'subcategorias',
        required: false,
        where: (!opts.isAdmin || query.includeInactive !== 'true') ? { is_active: true } : undefined,
      }
    ],
  });
}

/**
 * @param {number} id
 * @param {object} opts - { isAdmin }
 * @returns {Promise<Categoria|null>}
 */
async function findById(id, opts = {}) {
  return Categoria.findByPk(id, {
    include: [{ model: Categoria, as: 'subcategorias' }],
  });
}

/**
 * @param {string} slug
 * @param {object} opts - { isAdmin }
 * @returns {Promise<Categoria|null>}
 */
async function findBySlug(slug, opts = {}) {
  const where = { slug };
  if (!opts.isAdmin) where.is_active = true;

  return Categoria.findOne({
    where,
    include: [{ model: Categoria, as: 'subcategorias' }],
  });
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
  const count = await Categoria.count({ where });
  return count > 0;
}

/**
 * @param {object} data
 * @returns {Promise<Categoria>}
 */
async function create(data) {
  return Categoria.create(data);
}

/**
 * @param {Categoria} categoria
 * @param {object}    data
 * @returns {Promise<Categoria>}
 */
async function update(categoria, data) {
  return categoria.update(data);
}

/**
 * @param {Categoria} categoria
 * @param {boolean}   value
 */
async function setActive(categoria, value) {
  return categoria.update({ is_active: value });
}

/**
 * @param {Categoria} categoria
 */
async function destroy(categoria) {
  return categoria.destroy();
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
