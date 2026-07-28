'use strict';

/**
 * paginate.js
 *
 * Genera las opciones de limit/offset para Sequelize y el objeto
 * de metadatos de paginación para la respuesta.
 *
 * Uso en un repository:
 *   const { limit, offset } = getPaginationOptions(req.query);
 *   const { rows, count }   = await Model.findAndCountAll({ limit, offset, ... });
 *   return buildPaginationMeta(count, page, limit);
 */

const DEFAULT_LIMIT = 12;
const MAX_LIMIT     = 100;

/**
 * Parsea y valida page y limit de los query params.
 * @param {{ page?: string, limit?: string }} query
 * @returns {{ page: number, limit: number, offset: number }}
 */
function getPaginationOptions(query = {}) {
  const page  = Math.max(1, parseInt(query.page,  10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Construye el objeto meta de paginación para incluir en la respuesta.
 * @param {number} totalItems
 * @param {number} page
 * @param {number} limit
 * @returns {{ totalItems, totalPages, currentPage, perPage, hasNext, hasPrev }}
 */
function buildPaginationMeta(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    totalPages,
    currentPage: page,
    perPage:     limit,
    hasNext:     page < totalPages,
    hasPrev:     page > 1,
  };
}

module.exports = { getPaginationOptions, buildPaginationMeta };
