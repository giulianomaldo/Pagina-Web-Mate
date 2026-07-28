'use strict';

/**
 * Wrapper de respuesta exitosa para mantener un contrato uniforme en toda la API.
 *
 * Todas las respuestas exitosas tienen la forma:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data":    { ... }       // opcional
 *   "meta":    { ... }       // paginación, etc. (opcional)
 * }
 *
 * Uso en un controller:
 *   return ApiResponse.ok(res, 'Productos obtenidos', { products }, { total, page });
 *   return ApiResponse.created(res, 'Producto creado', { product });
 *   return ApiResponse.noContent(res);
 */
class ApiResponse {
  /**
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {*}      data
   * @param {object} meta  - info de paginación u otros metadatos
   */
  static send(res, statusCode, message, data = null, meta = null) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (meta !== null) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  /** 200 */
  static ok(res, message = 'OK', data = null, meta = null) {
    return ApiResponse.send(res, 200, message, data, meta);
  }

  /** 201 */
  static created(res, message = 'Creado correctamente', data = null) {
    return ApiResponse.send(res, 201, message, data);
  }

  /** 204 — sin cuerpo */
  static noContent(res) {
    return res.status(204).end();
  }
}

module.exports = ApiResponse;
