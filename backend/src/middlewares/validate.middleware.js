'use strict';

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * validate.middleware.js
 *
 * Ejecuta los resultados de las chains de express-validator.
 * Se usa DESPUÉS de las chains de validación en cada ruta:
 *
 *   router.post('/login', loginValidator, validate, authController.login);
 *
 * Si hay errores, lanza ApiError(400) con el array de mensajes formateado.
 * Si no hay errores, llama a next() para continuar al controller.
 */
function validate(req, _res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Formateamos los errores en un array plano de strings legibles
    const messages = errors.array().map((e) => ({
      campo:   e.path,
      mensaje: e.msg,
    }));

    throw ApiError.badRequest('Error de validación.', messages);
  }

  next();
}

module.exports = validate;
