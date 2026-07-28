'use strict';

const proveedorRepo = require('../repositories/proveedor.repository');
const ApiError = require('../utils/ApiError');

/**
 * proveedor.service.js
 *
 * Capa de lógica de negocio para Proveedor.
 */

async function getAll(query) {
  return proveedorRepo.findAll(query);
}

async function getOne(id) {
  const proveedor = await proveedorRepo.findById(id);
  if (!proveedor) throw ApiError.notFound('Proveedor no encontrado.');
  return proveedor;
}

async function create(data) {
  return proveedorRepo.create(data);
}

async function update(id, data) {
  const proveedor = await proveedorRepo.findById(id);
  if (!proveedor) throw ApiError.notFound('Proveedor no encontrado.');
  return proveedorRepo.update(proveedor, data);
}

async function destroy(id) {
  const proveedor = await proveedorRepo.findById(id);
  if (!proveedor) throw ApiError.notFound('Proveedor no encontrado.');
  await proveedorRepo.destroy(proveedor);
}

async function activar(id) {
  const proveedor = await proveedorRepo.findById(id);
  if (!proveedor) throw ApiError.notFound('Proveedor no encontrado.');
  if (proveedor.is_active) throw ApiError.conflict('El proveedor ya está activo.');
  return proveedorRepo.setActive(proveedor, true);
}

async function desactivar(id) {
  const proveedor = await proveedorRepo.findById(id);
  if (!proveedor) throw ApiError.notFound('Proveedor no encontrado.');
  if (!proveedor.is_active) throw ApiError.conflict('El proveedor ya está inactivo.');
  return proveedorRepo.setActive(proveedor, false);
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  destroy,
  activar,
  desactivar,
};
