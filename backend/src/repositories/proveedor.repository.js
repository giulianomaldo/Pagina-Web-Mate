'use strict';

const { Op } = require('sequelize');
const { Proveedor } = require('../models');

/**
 * proveedor.repository.js
 *
 * Capa de acceso a datos para Proveedor.
 */

/**
 * Lista todos los proveedores.
 * @param {object} query - Parámetros de búsqueda opcionales
 * @returns {Promise<Proveedor[]>}
 */
async function findAll(query = {}) {
  const where = {};

  if (query.includeInactive !== 'true') {
    where.is_active = true;
  }

  if (query.busqueda) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${query.busqueda}%` } },
      { cuit: { [Op.like]: `%${query.busqueda}%` } },
    ];
  }

  return Proveedor.findAll({
    where,
    order: [['nombre', 'ASC']],
  });
}

/**
 * @param {number} id
 * @returns {Promise<Proveedor|null>}
 */
async function findById(id) {
  return Proveedor.findByPk(id);
}

/**
 * @param {object} data
 * @returns {Promise<Proveedor>}
 */
async function create(data) {
  return Proveedor.create(data);
}

/**
 * @param {Proveedor} proveedor
 * @param {object} data
 * @returns {Promise<Proveedor>}
 */
async function update(proveedor, data) {
  return proveedor.update(data);
}

/**
 * @param {Proveedor} proveedor
 * @param {boolean} value
 */
async function setActive(proveedor, value) {
  return proveedor.update({ is_active: value });
}

/**
 * @param {Proveedor} proveedor
 */
async function destroy(proveedor) {
  return proveedor.destroy();
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  setActive,
  destroy,
};
