'use strict';

const { Op } = require('sequelize');
const { Promocion, Categoria, UsuarioAdministrador, Producto, sequelize } = require('../models');

/**
 * promocion.repository.js
 */

async function findAll(query = {}) {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;
  const where = {};

  if (query.busqueda) {
    where.nombre = { [Op.like]: `%${query.busqueda}%` };
  }

  // Si se pide "activos" (ej: listado público)
  if (query.activas === 'true') {
    const now = new Date();
    where.is_active = true;
    where.fecha_inicio = { [Op.lte]: now };
    where.fecha_fin = { [Op.gte]: now };
    // Que tengan usos disponibles
    where[Op.or] = [
      { usos_maximos: null },
      { usos_actuales: { [Op.lt]: sequelize.col('usos_maximos') } },
    ];
  }

  const { rows, count } = await Promocion.findAndCountAll({
    where,
    order: [['fecha_inicio', 'DESC']],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    include: [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
      { model: UsuarioAdministrador, as: 'autor', attributes: ['nombre', 'email'] },
      { model: Producto, as: 'productos', attributes: ['id', 'nombre'], through: { attributes: [] } },
    ],
    distinct: true,
  });

  return { rows, count, page, limit };
}

async function findById(id) {
  return Promocion.findByPk(id, {
    include: [
      { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
      { model: Producto, as: 'productos', attributes: ['id', 'nombre'], through: { attributes: [] } },
    ]
  });
}

async function create(data, productIds = []) {
  const promocion = await Promocion.create(data);
  if (data.aplica_a === 'producto' && productIds.length > 0) {
    await promocion.setProductos(productIds);
  }
  return findById(promocion.id);
}

async function update(promocion, data, productIds) {
  await promocion.update(data);
  if (data.aplica_a === 'producto' && Array.isArray(productIds)) {
    await promocion.setProductos(productIds);
  } else if (data.aplica_a !== 'producto') {
    await promocion.setProductos([]); // Limpiar
  }
  return findById(promocion.id);
}

async function setActive(promocion, value) {
  return promocion.update({ is_active: value });
}

async function destroy(promocion) {
  return promocion.destroy();
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  setActive,
  destroy,
};
