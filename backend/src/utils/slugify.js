'use strict';

/**
 * slugify.js
 *
 * Convierte un string en un slug URL-friendly.
 * Maneja correctamente caracteres del español (tildes, ñ, ü).
 *
 * Ejemplos:
 *   slugify('Mate de Calabaza')         → 'mate-de-calabaza'
 *   slugify('Yerba Taragüi Añejo')      → 'yerba-taragui-anejo'
 *   slugify('Bombilla  #1 (especial)')  → 'bombilla-1-especial'
 */
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')                          // descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')           // elimina los diacríticos (tildes)
    .replace(/ñ/g, 'n')
    .replace(/ü/g, 'u')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')             // elimina caracteres especiales
    .replace(/\s+/g, '-')                      // espacios → guiones
    .replace(/-+/g, '-')                       // múltiples guiones → uno
    .replace(/^-+|-+$/g, '');                  // guiones al inicio/fin
}

/**
 * Genera un slug único añadiendo un sufijo numérico si ya existe en la DB.
 *
 * @param {string}   baseText       - Texto base (nombre del producto)
 * @param {Function} existsFn       - async (slug) => boolean — consulta si el slug ya existe
 * @param {number}   [excludeId]    - ID a excluir (para updates)
 * @returns {Promise<string>}
 */
async function generateUniqueSlug(baseText, existsFn, excludeId = null) {
  const base = slugify(baseText);
  let   slug = base;
  let   count = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await existsFn(slug, excludeId)) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
}

module.exports = { slugify, generateUniqueSlug };
