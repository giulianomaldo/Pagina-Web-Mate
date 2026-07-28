'use strict';

const { Op } = require('sequelize');
const { UsuarioAdministrador } = require('../models');

/**
 * admin.repository.js
 */

async function findAll(query = {}) {
  const where = {};
  if (query.busqueda) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${query.busqueda}%` } },
      { email: { [Op.like]: `%${query.busqueda}%` } },
    ];
  }

  return UsuarioAdministrador.findAll({
    where,
    order: [['nombre', 'ASC']],
    attributes: { exclude: ['password_hash'] },
  });
}

async function findById(id) {
  return UsuarioAdministrador.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
  });
}

async function findByEmail(email) {
  return UsuarioAdministrador.findOne({ where: { email } });
}

async function create(data) {
  return UsuarioAdministrador.create(data);
}

async function update(admin, data) {
  return admin.update(data);
}

async function setActive(admin, value) {
  return admin.update({ is_active: value });
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  setActive,
};
