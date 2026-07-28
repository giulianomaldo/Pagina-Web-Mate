'use strict';

const adminRepo = require('../repositories/admin.repository');
const ApiError = require('../utils/ApiError');

/**
 * admin.service.js
 */

async function getAll(query) {
  return adminRepo.findAll(query);
}

async function getOne(id) {
  const admin = await adminRepo.findById(id);
  if (!admin) throw ApiError.notFound('Administrador no encontrado.');
  return admin;
}

async function create(data) {
  const exist = await adminRepo.findByEmail(data.email);
  if (exist) throw ApiError.conflict('El email ya está registrado.');

  const admin = await adminRepo.create(data);
  const adminData = admin.toJSON();
  delete adminData.password_hash;
  return adminData;
}

async function update(id, data) {
  const admin = await adminRepo.findById(id);
  if (!admin) throw ApiError.notFound('Administrador no encontrado.');

  if (data.email && data.email !== admin.email) {
    const exist = await adminRepo.findByEmail(data.email);
    if (exist) throw ApiError.conflict('El email ya está en uso por otro administrador.');
  }

  await adminRepo.update(admin, data);
  
  // Reload
  return getOne(id);
}

async function activar(id) {
  const admin = await adminRepo.findById(id);
  if (!admin) throw ApiError.notFound('Administrador no encontrado.');
  if (admin.is_active) throw ApiError.conflict('El administrador ya está activo.');
  return adminRepo.setActive(admin, true);
}

async function desactivar(id, requestAdminId) {
  const admin = await adminRepo.findById(id);
  if (!admin) throw ApiError.notFound('Administrador no encontrado.');
  
  if (admin.id === requestAdminId) {
    throw ApiError.conflict('No puedes desactivarte a ti mismo.');
  }

  if (!admin.is_active) throw ApiError.conflict('El administrador ya está inactivo.');
  
  return adminRepo.setActive(admin, false);
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  activar,
  desactivar,
};
