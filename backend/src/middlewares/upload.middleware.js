'use strict';

const multer   = require('multer');
const ApiError = require('../utils/ApiError');
const { MAX_BYTES, ALLOWED_FORMATS } = require('../services/cloudinary.service');

/**
 * upload.middleware.js
 *
 * Configura Multer con memoryStorage para que el buffer llegue
 * directamente al cloudinary.service sin escribir archivos en disco.
 *
 * Uso en rutas:
 *   router.post('/', upload.single('imagen'), productController.create);
 *   router.put('/:id', upload.fields([
 *     { name: 'imagen',   maxCount: 1 },
 *     { name: 'imagenes', maxCount: 5 },
 *   ]), productController.update);
 */

const storage = multer.memoryStorage();

/**
 * Filtro de tipo de archivo.
 * Rechaza archivos que no sean imágenes de los formatos permitidos.
 */
function fileFilter(_req, file, cb) {
  const ext = file.mimetype.split('/')[1]?.toLowerCase();

  if (!ALLOWED_FORMATS.includes(ext) && file.mimetype !== 'image/jpeg') {
    return cb(
      new ApiError(400, `Formato de imagen no permitido. Formatos aceptados: ${ALLOWED_FORMATS.join(', ')}.`),
      false,
    );
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:  MAX_BYTES,      // 5 MB por archivo
    files:     6,              // máximo 6 archivos por request (1 principal + 5 galería)
  },
});

/**
 * Middleware que captura los errores de Multer (tamaño excedido, formato inválido)
 * y los convierte a ApiError para que el error.middleware los maneje uniformemente.
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, `La imagen excede el tamaño máximo permitido (${MAX_BYTES / 1024 / 1024} MB).`));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, 'Se excedió el número máximo de archivos permitidos.'));
    }
    return next(new ApiError(400, `Error al procesar el archivo: ${err.message}`));
  }

  next(err);
}

module.exports = { upload, handleMulterError };
