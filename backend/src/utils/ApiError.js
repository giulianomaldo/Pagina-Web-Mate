'use strict';

/**
 * Clase de error personalizado para la API.
 *
 * Permite lanzar errores con statusCode HTTP directamente
 * desde cualquier capa (controller, service, middleware)
 * y que el error.middleware los capture y formatee de forma uniforme.
 *
 * Uso:
 *   throw new ApiError(404, 'Producto no encontrado');
 *   throw new ApiError(400, 'Email ya registrado');
 *   throw new ApiError(403, 'No tenés permisos');
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - Código HTTP (400, 401, 403, 404, 409, 500…)
   * @param {string} message    - Mensaje legible para el cliente
   * @param {Array}  errors     - Errores de validación adicionales (opcional)
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    this.name       = 'ApiError';
    this.statusCode = statusCode;
    this.errors     = errors;
    this.isOperational = true; // distingue errores esperados de bugs

    // Preserva el stack trace limpio (sin incluir el constructor)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  // ── Factories para los casos más comunes ──────────────

  static badRequest(message = 'Solicitud inválida', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'No autenticado') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acceso denegado') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflicto con datos existentes') {
    return new ApiError(409, message);
  }

  static internal(message = 'Error interno del servidor') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
