'use strict';

const cloudinary = require('../config/cloudinary');
const ApiError   = require('../utils/ApiError');

/**
 * cloudinary.service.js
 *
 * Abstrae las operaciones de Cloudinary: upload y delete.
 * Recibe el buffer de Multer (memoryStorage) y lo sube via stream.
 *
 * Folder structure en Cloudinary:
 *   encontrarte/productos/   ← imágenes de productos
 *   encontrarte/categorias/  ← imágenes de categorías
 *   encontrarte/marcas/      ← logos de marcas
 *   encontrarte/banners/     ← banners
 */

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const MAX_BYTES       = 5 * 1024 * 1024; // 5 MB

/**
 * Sube un buffer de imagen a Cloudinary usando un stream.
 *
 * @param {Buffer} buffer       - Buffer de Multer (memoryStorage)
 * @param {string} folder       - Carpeta destino en Cloudinary
 * @param {object} [options]    - Opciones adicionales de transformación
 * @returns {Promise<{ url: string, public_id: string }>}
 */
function uploadBuffer(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      allowed_formats: ALLOWED_FORMATS,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },   // entrega webp/avif según el navegador
      ],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(
            new ApiError(502, `Error al subir imagen a Cloudinary: ${error.message}`)
          );
        }
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );

    stream.end(buffer);
  });
}

/**
 * Elimina una imagen de Cloudinary por su public_id.
 * No lanza error si el public_id no existe (operación idempotente).
 *
 * @param {string} publicId
 * @returns {Promise<void>}
 */
async function deleteImage(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Logueamos pero no bloqueamos el flujo si la imagen ya no existe en Cloudinary
    console.warn(`⚠️  No se pudo eliminar imagen de Cloudinary (${publicId}):`, err.message);
  }
}

/**
 * Sube múltiples imágenes en paralelo.
 *
 * @param {Buffer[]} buffers
 * @param {string}   folder
 * @returns {Promise<Array<{ url: string, public_id: string }>>}
 */
async function uploadMultiple(buffers, folder) {
  return Promise.all(buffers.map((buf) => uploadBuffer(buf, folder)));
}

/**
 * Elimina múltiples imágenes en paralelo.
 *
 * @param {string[]} publicIds
 * @returns {Promise<void>}
 */
async function deleteMultiple(publicIds) {
  await Promise.all(publicIds.filter(Boolean).map(deleteImage));
}

module.exports = {
  uploadBuffer,
  deleteImage,
  uploadMultiple,
  deleteMultiple,
  MAX_BYTES,
  ALLOWED_FORMATS,
};
