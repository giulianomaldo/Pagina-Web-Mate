'use strict';

const categoriaRepo = require('../repositories/categoria.repository');
const cloudinarySvc = require('./cloudinary.service');
const { generateUniqueSlug } = require('../utils/slugify');
const ApiError = require('../utils/ApiError');

/**
 * categoria.service.js
 *
 * Capa de lógica de negocio para Categoria.
 */

const CLOUDINARY_FOLDER = 'encontrarte/categorias';

/**
 * Genera un slug único para una categoría.
 * @param {string} nombre
 * @param {number} [excludeId]
 */
async function buildSlug(nombre, excludeId = null) {
  return generateUniqueSlug(
    nombre,
    (slug, id) => categoriaRepo.slugExists(slug, id),
    excludeId,
  );
}

/**
 * Sube la imagen a Cloudinary.
 * @param {Express.Multer.File} [file]
 * @returns {Promise<{ imagen_url?: string, imagen_public_id?: string }>}
 */
async function uploadImage(file) {
  if (!file) return {};
  const { url, public_id } = await cloudinarySvc.uploadBuffer(file.buffer, CLOUDINARY_FOLDER);
  return { imagen_url: url, imagen_public_id: public_id };
}

// ── Métodos CRUD ──────────────────────────────────────────────────────

async function getAll(query, isAdmin = false) {
  return categoriaRepo.findAll(query, { isAdmin });
}

async function getOne(identifier, isAdmin = false) {
  const isId = !isNaN(Number(identifier));
  const categoria = isId
    ? await categoriaRepo.findById(Number(identifier), { isAdmin })
    : await categoriaRepo.findBySlug(identifier, { isAdmin });

  if (!categoria) throw ApiError.notFound('Categoría no encontrada.');
  return categoria;
}

async function create(data, file) {
  const slug = await buildSlug(data.nombre);
  const imageData = await uploadImage(file);

  return categoriaRepo.create({
    ...data,
    slug,
    ...imageData,
  });
}

async function update(id, data, file) {
  const categoria = await categoriaRepo.findById(id, { isAdmin: true });
  if (!categoria) throw ApiError.notFound('Categoría no encontrada.');

  if (data.parent_id && Number(data.parent_id) === Number(id)) {
    throw ApiError.badRequest('Una categoría no puede ser padre de sí misma.');
  }

  const slug = data.nombre && data.nombre !== categoria.nombre
    ? await buildSlug(data.nombre, id)
    : categoria.slug;

  let imageData = {};
  if (file) {
    const { url, public_id } = await cloudinarySvc.uploadBuffer(file.buffer, CLOUDINARY_FOLDER);
    await cloudinarySvc.deleteImage(categoria.imagen_public_id);
    imageData.imagen_url = url;
    imageData.imagen_public_id = public_id;
  }

  return categoriaRepo.update(categoria, { ...data, slug, ...imageData });
}

async function destroy(id) {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria) throw ApiError.notFound('Categoría no encontrada.');

  await cloudinarySvc.deleteImage(categoria.imagen_public_id);
  await categoriaRepo.destroy(categoria);
}

async function activar(id) {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria) throw ApiError.notFound('Categoría no encontrada.');
  if (categoria.is_active) throw ApiError.conflict('La categoría ya está activa.');
  return categoriaRepo.setActive(categoria, true);
}

async function desactivar(id) {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria) throw ApiError.notFound('Categoría no encontrada.');
  if (!categoria.is_active) throw ApiError.conflict('La categoría ya está inactiva.');
  return categoriaRepo.setActive(categoria, false);
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
