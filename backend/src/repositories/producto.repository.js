'use strict';

const { Op }       = require('sequelize');
const { Producto, Categoria, Marca, Proveedor } = require('../models');
const { getPaginationOptions, buildPaginationMeta } = require('../utils/paginate');

/**
 * producto.repository.js
 *
 * Capa de acceso a datos para Producto.
 * Solo habla con Sequelize — sin lógica de negocio.
 * El servicio consume este repositorio.
 *
 * Convención:
 *   - Todos los métodos son async.
 *   - Lanza errores nativos de Sequelize; el servicio los convierte a ApiError.
 */

// ── Includes base para los listados ──────────────────────────────────
const BASE_INCLUDES = [
  { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'slug', 'emoji'] },
  { model: Marca,     as: 'marca',     attributes: ['id', 'nombre', 'slug', 'logo_url'] },
];

// Include con proveedor (solo para admins)
const ADMIN_INCLUDES = [
  ...BASE_INCLUDES,
  { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre', 'email', 'telefono'] },
];

// ── findAll ───────────────────────────────────────────────────────────

/**
 * Lista productos con filtros dinámicos y paginación.
 *
 * @param {object} query - Parámetros de búsqueda (del request)
 * @param {object} opts  - { isAdmin } para incluir inactivos y proveedor
 * @returns {Promise<{ rows: Producto[], meta: object }>}
 */
async function findAll(query = {}, opts = {}) {
  const { page, limit, offset } = getPaginationOptions(query);
  const where = {};

  // Activos/inactivos
  if (!opts.isAdmin || query.includeInactive !== 'true') {
    where.is_active = true;
  }

  // Filtros opcionales
  if (query.categoria_id)  where.categoria_id  = query.categoria_id;
  if (query.marca_id)      where.marca_id       = query.marca_id;
  if (query.proveedor_id && opts.isAdmin)  where.proveedor_id = query.proveedor_id;
  if (query.is_destacado === 'true')  where.is_destacado  = true;
  if (query.is_nuevo      === 'true')  where.is_nuevo      = true;
  if (query.is_mas_vendido === 'true') where.is_mas_vendido = true;
  if (query.soloStock     === 'true')  where.stock         = { [Op.gt]: 0 };

  // Rango de precio
  if (query.precioMin || query.precioMax) {
    where.precio = {};
    if (query.precioMin) where.precio[Op.gte] = parseFloat(query.precioMin);
    if (query.precioMax) where.precio[Op.lte] = parseFloat(query.precioMax);
  }

  // Búsqueda por texto (nombre, tipo)
  if (query.busqueda) {
    const term = `%${query.busqueda}%`;
    where[Op.or] = [
      { nombre: { [Op.like]: term } },
      { tipo:   { [Op.like]: term } },
    ];
  }

  // Ordenamiento
  const ORDER_MAP = {
    precio_asc:   [['precio', 'ASC']],
    precio_desc:  [['precio', 'DESC']],
    nombre_asc:   [['nombre', 'ASC']],
    nombre_desc:  [['nombre', 'DESC']],
    recientes:    [['created_at', 'DESC']],
    stock_asc:    [['stock', 'ASC']],
  };
  const order = ORDER_MAP[query.orden] || [['created_at', 'DESC']];

  const { rows, count } = await Producto.findAndCountAll({
    where,
    include: opts.isAdmin ? ADMIN_INCLUDES : BASE_INCLUDES,
    order,
    limit,
    offset,
    distinct: true, // necesario cuando hay includes para que count sea correcto
  });

  return {
    rows,
    meta: buildPaginationMeta(count, page, limit),
  };
}

// ── findById ──────────────────────────────────────────────────────────

/**
 * @param {number} id
 * @param {object} opts  - { isAdmin }
 * @returns {Promise<Producto|null>}
 */
async function findById(id, opts = {}) {
  return Producto.findByPk(id, {
    include: opts.isAdmin ? ADMIN_INCLUDES : BASE_INCLUDES,
  });
}

// ── findBySlug ────────────────────────────────────────────────────────

/**
 * @param {string} slug
 * @param {object} opts  - { isAdmin }
 * @returns {Promise<Producto|null>}
 */
async function findBySlug(slug, opts = {}) {
  const where = { slug };
  if (!opts.isAdmin) where.is_active = true;

  return Producto.findOne({
    where,
    include: opts.isAdmin ? ADMIN_INCLUDES : BASE_INCLUDES,
  });
}

// ── slugExists ────────────────────────────────────────────────────────

/**
 * Verifica si un slug ya está en uso (excluye el producto actual en updates).
 * @param {string}  slug
 * @param {number}  [excludeId]
 * @returns {Promise<boolean>}
 */
async function slugExists(slug, excludeId = null) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const count = await Producto.count({ where });
  return count > 0;
}

// ── create ────────────────────────────────────────────────────────────

/**
 * @param {object} data - Atributos validados del producto
 * @returns {Promise<Producto>}
 */
async function create(data) {
  return Producto.create(data);
}

// ── update ────────────────────────────────────────────────────────────

/**
 * Actualiza un producto por instancia (el servicio carga el registro primero).
 * @param {Producto} producto - Instancia Sequelize
 * @param {object}   data     - Campos a actualizar
 * @returns {Promise<Producto>}
 */
async function update(producto, data) {
  return producto.update(data);
}

// ── Operaciones de campo único (PATCH) ───────────────────────────────

async function updateStock(producto, stock) {
  return producto.update({ stock });
}

async function updatePrecio(producto, precio) {
  return producto.update({ precio });
}

async function setActive(producto, value) {
  return producto.update({ is_active: value });
}

async function setDestacado(producto, value) {
  return producto.update({ is_destacado: value });
}

async function setNuevo(producto, value) {
  return producto.update({ is_nuevo: value });
}

async function setMasVendido(producto, value) {
  return producto.update({ is_mas_vendido: value });
}

// ── destroy (hard delete) ─────────────────────────────────────────────

/**
 * Eliminación permanente. Solo superadmin.
 * Usar con precaución — los order_items que referencien este producto quedarán
 * con snapshot de precio/nombre, por lo que la FK en order_items debe ser NULLABLE.
 * @param {Producto} producto
 */
async function destroy(producto) {
  return producto.destroy();
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  slugExists,
  create,
  update,
  updateStock,
  updatePrecio,
  setActive,
  setDestacado,
  setNuevo,
  setMasVendido,
  destroy,
};
