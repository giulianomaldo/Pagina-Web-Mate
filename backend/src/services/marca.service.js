'use strict';

const marcaRepo = require('../repositories/marca.repository');
const storageSvc = require('./supabase.service');
const { generateUniqueSlug } = require('../utils/slugify');
const ApiError = require('../utils/ApiError');

/**
 * marca.service.js
 *
 * Capa de lógica de negocio para Marca.
 */

const STORAGE_FOLDER = 'encontrarte/marcas';

/**
 * Genera un slug único para una marca.
 * @param {string} nombre
 * @param {number} [excludeId]
 */
async function buildSlug(nombre, excludeId = null) {
  return generateUniqueSlug(
    nombre,
    (slug, id) => marcaRepo.slugExists(slug, id),
    excludeId,
  );
}

/**
 * Sube el logo a Cloudinary.
 * @param {Express.Multer.File} [file]
 * @returns {Promise<{ logo_url?: string, logo_public_id?: string }>}
 */
async function uploadLogo(file) {
  if (!file) return {};
  const { url, public_id } = await storageSvc.uploadBuffer(file.buffer, STORAGE_FOLDER);
  return { logo_url: url, logo_public_id: public_id };
}

// ── Métodos CRUD ──────────────────────────────────────────────────────

async function getAll(query, isAdmin = false) {
  return marcaRepo.findAll(query, { isAdmin });
}

async function getOne(identifier, isAdmin = false) {
  const isId = !isNaN(Number(identifier));
  const marca = isId
    ? await marcaRepo.findById(Number(identifier), { isAdmin })
    : await marcaRepo.findBySlug(identifier, { isAdmin });

  if (!marca) throw ApiError.notFound('Marca no encontrada.');
  return marca;
}

async function create(data, file) {
  const slug = await buildSlug(data.nombre);
  const logoData = await uploadLogo(file);

  try {
    return await marcaRepo.create({
      ...data,
      slug,
      ...logoData,
    });
  } catch (err) {
    if (logoData.logo_public_id) {
      await storageSvc.deleteImage(logoData.logo_public_id).catch(console.error);
    }
    throw err;
  }

async function update(id, data, file) {
  const marca = await marcaRepo.findById(id, { isAdmin: true });
  if (!marca) throw ApiError.notFound('Marca no encontrada.');

  const slug = data.nombre && data.nombre !== marca.nombre
    ? await buildSlug(data.nombre, id)
    : marca.slug;

  let logoData = {};
  if (file) {
    const { url, public_id } = await storageSvc.uploadBuffer(file.buffer, STORAGE_FOLDER);
    logoData.logo_url = url;
    logoData.logo_public_id = public_id;
  }

  try {
    const updated = await marcaRepo.update(marca, { ...data, slug, ...logoData });
    if (logoData.logo_public_id && marca.logo_public_id) {
      await storageSvc.deleteImage(marca.logo_public_id).catch(console.error);
    }
    return updated;
  } catch (err) {
    if (logoData.logo_public_id) {
      await storageSvc.deleteImage(logoData.logo_public_id).catch(console.error);
    }
    throw err;
  }
}

async function destroy(id) {
  const marca = await marcaRepo.findById(id);
  if (!marca) throw ApiError.notFound('Marca no encontrada.');

  await storageSvc.deleteImage(marca.logo_public_id);
  await marcaRepo.destroy(marca);
}

async function activar(id) {
  const marca = await marcaRepo.findById(id);
  if (!marca) throw ApiError.notFound('Marca no encontrada.');
  if (marca.is_active) throw ApiError.conflict('La marca ya está activa.');
  return marcaRepo.setActive(marca, true);
}

async function desactivar(id) {
  const marca = await marcaRepo.findById(id);
  if (!marca) throw ApiError.notFound('Marca no encontrada.');
  if (!marca.is_active) throw ApiError.conflict('La marca ya está inactiva.');
  return marcaRepo.setActive(marca, false);
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
