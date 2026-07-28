'use strict';

const { Op } = require('sequelize');
const { Orden, OrderItem, Producto, sequelize } = require('../models');

/**
 * orden.repository.js
 */

async function findAll(query = {}) {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;
  const where = {};

  if (query.status) where.status = query.status;
  if (query.busqueda) {
    where[Op.or] = [
      { customer_name: { [Op.like]: `%${query.busqueda}%` } },
      { customer_phone: { [Op.like]: `%${query.busqueda}%` } },
    ];
  }

  const { rows, count } = await Orden.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    include: [{ model: OrderItem, as: 'items' }],
    distinct: true,
  });

  return { rows, count, page, limit };
}

async function findById(id) {
  return Orden.findByPk(id, {
    include: [{ model: OrderItem, as: 'items' }],
  });
}

/**
 * Crea una orden, sus items y descuenta stock en una transacción atómica.
 * @param {object} ordenData
 * @param {Array} itemsData
 * @returns {Promise<Orden>}
 */
async function createWithTransaction(ordenData, itemsData) {
  const transaction = await sequelize.transaction();

  try {
    const orden = await Orden.create(ordenData, { transaction });

    for (const item of itemsData) {
      await OrderItem.create({ ...item, order_id: orden.id }, { transaction });

      // Descontar stock
      await Producto.decrement('stock', {
        by: item.quantity,
        where: { id: item.product_id },
        transaction,
      });
    }

    await transaction.commit();
    return findById(orden.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function updateStatus(orden, status) {
  return orden.update({ status });
}

module.exports = {
  findAll,
  findById,
  createWithTransaction,
  updateStatus,
};
