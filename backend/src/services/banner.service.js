'use strict';

const bannerRepo = require('../repositories/banner.repository');
const storageSvc = require('./supabase.service');
const ApiError = require('../utils/ApiError');

/**
 * banner.service.js
 */

const STORAGE_FOLDER = 'encontrarte/banners';

async function uploadImage(file) {
  if (!file) return {};
  const { url, public_id } = await storageSvc.uploadBuffer(file.buffer, STORAGE_FOLDER);
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
  
  try {
    return await bannerRepo.create({
      ...data,
      creado_por: adminId,
      ...imageData,
    });
  } catch (err) {
    if (imageData.imagen_public_id) {
      await storageSvc.deleteImage(imageData.imagen_public_id).catch(console.error);
    }
    throw err;
  }
}

async function update(id, data, file) {
  const banner = await bannerRepo.findById(id);
  if (!banner) throw ApiError.notFound('Banner no encontrado.');

  let imageData = {};
  if (file) {
    const { url, public_id } = await storageSvc.uploadBuffer(
      file.buffer,
      STORAGE_FOLDER,
    );
    imageData.imagen_url = url;
    imageData.imagen_public_id = public_id;
  }

  try {
    const updated = await bannerRepo.update(banner, { ...data, ...imageData });
    if (imageData.imagen_public_id && banner.imagen_public_id) {
      await storageSvc.deleteImage(banner.imagen_public_id).catch(console.error);
    }
    return updated;
  } catch (err) {
    if (imageData.imagen_public_id) {
      await storageSvc.deleteImage(imageData.imagen_public_id).catch(console.error);
    }
    throw err;
  }
}

async function destroy(id) {
  const banner = await bannerRepo.findById(id);
  if (!banner) throw ApiError.notFound('Banner no encontrado.');

  await storageSvc.deleteImage(banner.imagen_public_id);
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
