'use strict';

const bannerRepo = require('../repositories/banner.repository');
const cloudinarySvc = require('./cloudinary.service');
const ApiError = require('../utils/ApiError');

/**
 * banner.service.js
 */

const CLOUDINARY_FOLDER = 'encontrarte/banners';

async function uploadImage(file) {
  if (!file) return {};
  const { url, public_id } = await cloudinarySvc.uploadBuffer(file.buffer, CLOUDINARY_FOLDER);
  return { imagen_url: url, imagen_public_id: public_id };
}

async function getAll(query, isAdmin = false) {
  // query puede incluir posicion
  return bannerRepo.findAll({ isAdmin, posicion: query.posicion });
}

async function getOne(id) {
  const banner = await bannerRepo.findById(id);
  if (!banner) throw ApiError.notFound('Banner no encontrado.');
  return banner;
}

async function create(data, file, adminId) {
  if (!file) throw ApiError.badRequest('La imagen del banner es obligatoria.');
  
  const imageData = await uploadImage(file);
  
  return bannerRepo.create({
    ...data,
    creado_por: adminId,
    ...imageData,
  });
}

async function update(id, data, file) {
  const banner = await bannerRepo.findById(id);
  if (!banner) throw ApiError.notFound('Banner no encontrado.');

  let imageData = {};
  if (file) {
    const { url, public_id } = await cloudinarySvc.uploadBuffer(file.buffer, CLOUDINARY_FOLDER);
    await cloudinarySvc.deleteImage(banner.imagen_public_id);
    imageData.imagen_url = url;
    imageData.imagen_public_id = public_id;
  }

  return bannerRepo.update(banner, { ...data, ...imageData });
}

async function destroy(id) {
  const banner = await bannerRepo.findById(id);
  if (!banner) throw ApiError.notFound('Banner no encontrado.');

  await cloudinarySvc.deleteImage(banner.imagen_public_id);
  await bannerRepo.destroy(banner);
}

async function activar(id) {
  const banner = await bannerRepo.findById(id);
  if (!banner) throw ApiError.notFound('Banner no encontrado.');
  if (banner.is_active) throw ApiError.conflict('El banner ya está activo.');
  return bannerRepo.setActive(banner, true);
}

async function desactivar(id) {
  const banner = await bannerRepo.findById(id);
  if (!banner) throw ApiError.notFound('Banner no encontrado.');
  if (!banner.is_active) throw ApiError.conflict('El banner ya está inactivo.');
  return bannerRepo.setActive(banner, false);
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
