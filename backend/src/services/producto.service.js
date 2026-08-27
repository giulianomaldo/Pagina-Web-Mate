'use strict';

const productoRepo      = require('../repositories/producto.repository');
const storageSvc     = require('./supabase.service');
const { generateUniqueSlug } = require('../utils/slugify');
const ApiError          = require('../utils/ApiError');

/**
 * producto.service.js
 *
 * Capa de lógica de negocio para Producto.
 * Orquesta el repositorio + Cloudinary + generación de slugs.
 * No conoce Express (req/res) — recibe datos planos, devuelve instancias.
 */

const STORAGE_FOLDER = 'encontrarte/productos';

// ── Helpers privados ──────────────────────────────────────────────────

/**
 * Genera un slug único para un producto.
 * @param {string} nombre
 * @param {number} [excludeId]
 */
async function buildSlug(nombre, excludeId = null) {
  return generateUniqueSlug(
    nombre,
    (slug, id) => productoRepo.slugExists(slug, id),
    excludeId,
  );
}

/**
 * Sube la imagen principal y la galería de un producto.
 * @param {Express.Multer.File}   [mainFile]
 * @param {Express.Multer.File[]} [galleryFiles]
 * @returns {Promise<{ imagen_url, imagen_public_id, imagenes }>}
 */
async function uploadImages(mainFile, galleryFiles = []) {
  const result = {};

  if (mainFile) {
    const { url, public_id } = await storageSvc.uploadBuffer(
      mainFile.buffer,
      STORAGE_FOLDER,
    );
    result.imagen_url       = url;
    result.imagen_public_id = public_id;
  }

  if (galleryFiles.length > 0) {
    result.imagenes = await storageSvc.uploadMultiple(
      galleryFiles.map((f) => f.buffer),
      STORAGE_FOLDER,
    );
  }

  return result;
}

// ── getAll ────────────────────────────────────────────────────────────

async function getAll(query, isAdmin = false) {
  return productoRepo.findAll(query, { isAdmin });
}

// ── getOne ────────────────────────────────────────────────────────────

/**
 * Busca por ID o slug.
 * @param {string|number} identifier - ID numérico o slug string
 * @param {boolean}       isAdmin
 */
async function getOne(identifier, isAdmin = false) {
  const isId    = !isNaN(Number(identifier));
  const producto = isId
    ? await productoRepo.findById(Number(identifier), { isAdmin })
    : await productoRepo.findBySlug(identifier, { isAdmin });

  if (!producto) {
    throw ApiError.notFound('Producto no encontrado.');
  }

  return producto;
}

// ── create ────────────────────────────────────────────────────────────

async function create(data, files = {}) {
  // 1. Generar slug único
  const slug = await buildSlug(data.nombre);

  // 2. Subir imágenes si se adjuntaron
  const imageData = await uploadImages(
    files.imagen?.[0],
    files.imagenes || [],
  );

  try {
    // 3. Crear en DB
    const producto = await productoRepo.create({
      ...data,
      slug,
      ...imageData,
    });

    // 4. Recargar con relaciones para devolver el objeto completo
    return productoRepo.findById(producto.id, { isAdmin: true });
  } catch (err) {
    // Rollback de imágenes si falla la BD
    if (imageData.imagen_public_id) {
      await storageSvc.deleteImage(imageData.imagen_public_id).catch(console.error);
    }
    if (imageData.imagenes?.length > 0) {
      const publicIds = imageData.imagenes.map(i => i.public_id);
      await storageSvc.deleteMultiple(publicIds).catch(console.error);
    }
    throw err;
  }
}

// ── update ────────────────────────────────────────────────────────────

async function update(id, data, files = {}) {
  const producto = await productoRepo.findById(id, { isAdmin: true });
  if (!producto) throw ApiError.notFound('Producto no encontrado.');

  // 1. Regenerar slug si cambió el nombre
  const slug = data.nombre && data.nombre !== producto.nombre
    ? await buildSlug(data.nombre, id)
    : producto.slug;

  // 2. Manejar imagen principal
  let imageData = {};
  if (files.imagen?.[0]) {
    // Subir nueva imagen
    const { url, public_id } = await storageSvc.uploadBuffer(
      files.imagen[0].buffer,
      STORAGE_FOLDER,
    );
    imageData.imagen_url       = url;
    imageData.imagen_public_id = public_id;
  }

  // 3. Manejar galería si se reemplaza
  if (files.imagenes?.length > 0) {
    imageData.imagenes = await storageSvc.uploadMultiple(
      files.imagenes.map((f) => f.buffer),
      STORAGE_FOLDER,
    );
  }

  try {
    // 4. Actualizar en DB
    await productoRepo.update(producto, {
      ...data,
      slug,
      ...imageData,
    });

    // 5. Eliminar imágenes viejas solo si la actualización fue exitosa
    if (imageData.imagen_public_id && producto.imagen_public_id) {
      await storageSvc.deleteImage(producto.imagen_public_id).catch(console.error);
    }
    if (imageData.imagenes?.length > 0 && producto.imagenes?.length > 0) {
      const oldPublicIds = producto.imagenes.map((i) => i.public_id);
      await storageSvc.deleteMultiple(oldPublicIds).catch(console.error);
    }

    return productoRepo.findById(id, { isAdmin: true });
  } catch (err) {
    // Rollback de nuevas imágenes si falla la BD
    if (imageData.imagen_public_id) {
      await storageSvc.deleteImage(imageData.imagen_public_id).catch(console.error);
    }
    if (imageData.imagenes?.length > 0) {
      const publicIds = imageData.imagenes.map(i => i.public_id);
      await storageSvc.deleteMultiple(publicIds).catch(console.error);
    }
    throw err;
  }
}

// ── destroy ───────────────────────────────────────────────────────────

async function destroy(id) {
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');

  // Eliminar imágenes de Storage antes de destruir el registro
  await storageSvc.deleteImage(producto.imagen_public_id);
  const galleryIds = (producto.imagenes || []).map((i) => i.public_id);
  await storageSvc.deleteMultiple(galleryIds);

  await productoRepo.destroy(producto);
}

// ── PATCH: operaciones de campo único ────────────────────────────────

async function cambiarStock(id, stock) {
  if (stock < 0) throw ApiError.badRequest('El stock no puede ser negativo.');
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');
  return productoRepo.updateStock(producto, stock);
}

async function cambiarPrecio(id, precio) {
  if (precio <= 0) throw ApiError.badRequest('El precio debe ser mayor a 0.');
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');
  return productoRepo.updatePrecio(producto, precio);
}

async function activar(id) {
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');
  if (producto.is_active) throw ApiError.conflict('El producto ya está activo.');
  return productoRepo.setActive(producto, true);
}

async function desactivar(id) {
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');
  if (!producto.is_active) throw ApiError.conflict('El producto ya está inactivo.');
  return productoRepo.setActive(producto, false);
}

async function toggleDestacado(id) {
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');
  return productoRepo.setDestacado(producto, !producto.is_destacado);
}

async function toggleNuevo(id) {
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');
  return productoRepo.setNuevo(producto, !producto.is_nuevo);
}

async function toggleMasVendido(id) {
  const producto = await productoRepo.findById(id);
  if (!producto) throw ApiError.notFound('Producto no encontrado.');
  return productoRepo.setMasVendido(producto, !producto.is_mas_vendido);
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  destroy,
  cambiarStock,
  cambiarPrecio,
  activar,
  desactivar,
  toggleDestacado,
  toggleNuevo,
  toggleMasVendido,
};
