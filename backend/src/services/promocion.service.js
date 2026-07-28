'use strict';

const promocionRepo = require('../repositories/promocion.repository');
const ApiError = require('../utils/ApiError');
const { buildPaginationMeta } = require('../utils/paginate');
const { Producto, Categoria } = require('../models');

/**
 * promocion.service.js
 */

async function getAll(query) {
  const result = await promocionRepo.findAll(query);
  return {
    promociones: result.rows,
    meta: buildPaginationMeta(result.count, result.page, result.limit),
  };
}

async function getOne(id) {
  const promocion = await promocionRepo.findById(id);
  if (!promocion) throw ApiError.notFound('Promoción no encontrada.');
  return promocion;
}

async function create(data, productIds, adminId) {
  if (data.aplica_a === 'categoria' && !data.categoria_id) {
    throw ApiError.badRequest('Debe especificar una categoría si la promoción aplica a categoría.');
  }
  if (data.aplica_a === 'producto' && (!productIds || productIds.length === 0)) {
    throw ApiError.badRequest('Debe especificar al menos un producto si la promoción aplica a productos específicos.');
  }

  const promoData = {
    ...data,
    creado_por: adminId,
  };

  return promocionRepo.create(promoData, productIds);
}

async function update(id, data, productIds) {
  const promocion = await promocionRepo.findById(id);
  if (!promocion) throw ApiError.notFound('Promoción no encontrada.');

  if (data.aplica_a === 'categoria' && !data.categoria_id) {
    throw ApiError.badRequest('Debe especificar una categoría.');
  }
  if (data.aplica_a === 'producto' && (!productIds || productIds.length === 0)) {
    throw ApiError.badRequest('Debe especificar al menos un producto.');
  }

  return promocionRepo.update(promocion, data, productIds);
}

async function destroy(id) {
  const promocion = await promocionRepo.findById(id);
  if (!promocion) throw ApiError.notFound('Promoción no encontrada.');
  await promocionRepo.destroy(promocion);
}

async function activar(id) {
  const promocion = await promocionRepo.findById(id);
  if (!promocion) throw ApiError.notFound('Promoción no encontrada.');
  if (promocion.is_active) throw ApiError.conflict('La promoción ya está activa.');
  return promocionRepo.setActive(promocion, true);
}

async function desactivar(id) {
  const promocion = await promocionRepo.findById(id);
  if (!promocion) throw ApiError.notFound('Promoción no encontrada.');
  if (!promocion.is_active) throw ApiError.conflict('La promoción ya está inactiva.');
  return promocionRepo.setActive(promocion, false);
}

/**
 * Valida un cupón y recalcula el carrito.
 * payload = { nombre: "VERANO2025", items: [{ product_id: 1, quantity: 2, price: 1000 }] }
 */
async function validarYCalcular(nombre, items) {
  // 1. Buscar promoción
  const { rows } = await promocionRepo.findAll({ busqueda: nombre, activas: 'true', limit: 1 });
  if (rows.length === 0) {
    throw ApiError.notFound('El cupón ingresado no existe, está inactivo o expiró.');
  }

  const promo = await getOne(rows[0].id); // Trae relaciones completas

  // 2. Calcular subtotal del carrito original
  let subtotalOriginal = 0;
  items.forEach(i => { subtotalOriginal += (i.price * i.quantity); });

  if (Number(subtotalOriginal) < Number(promo.compra_minima)) {
    throw ApiError.badRequest(`El cupón requiere una compra mínima de $${promo.compra_minima}.`);
  }

  // 3. Identificar qué productos aplican
  let totalDescuento = 0;
  let aplicaAlguna = false;

  for (const item of items) {
    let aplica = false;
    
    if (promo.aplica_a === 'todos') {
      aplica = true;
    } 
    else if (promo.aplica_a === 'categoria') {
      const dbProd = await Producto.findByPk(item.product_id);
      if (dbProd && dbProd.categoria_id === promo.categoria_id) {
        aplica = true;
      }
    } 
    else if (promo.aplica_a === 'producto') {
      const estaEnPromo = promo.productos.some(p => p.id === item.product_id);
      if (estaEnPromo) aplica = true;
    }

    if (aplica) {
      aplicaAlguna = true;
      const sub = item.price * item.quantity;
      if (promo.tipo_descuento === 'porcentaje') {
        totalDescuento += sub * (Number(promo.valor_descuento) / 100);
      }
    }
  }

  if (promo.tipo_descuento === 'monto_fijo' && aplicaAlguna) {
    totalDescuento = Number(promo.valor_descuento);
  }

  if (!aplicaAlguna) {
    throw ApiError.badRequest('El cupón no aplica a ninguno de los productos en tu carrito.');
  }

  // Evitar descuento mayor al total
  if (totalDescuento > subtotalOriginal) {
    totalDescuento = subtotalOriginal;
  }

  return {
    promocion: {
      nombre: promo.nombre,
      descripcion: promo.descripcion,
      tipo_descuento: promo.tipo_descuento,
      valor_descuento: promo.valor_descuento
    },
    subtotal: subtotalOriginal,
    descuento: totalDescuento,
    total: subtotalOriginal - totalDescuento
  };
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  destroy,
  activar,
  desactivar,
  validarYCalcular,
};
