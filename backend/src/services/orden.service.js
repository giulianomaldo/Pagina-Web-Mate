'use strict';

const ordenRepo = require('../repositories/orden.repository');
const { Producto } = require('../models');
const ApiError = require('../utils/ApiError');
const { buildPaginationMeta } = require('../utils/paginate');

/**
 * orden.service.js
 */

const WHATSAPP_NUMBER = '5491100000000'; // Configurar por variable de entorno luego

async function getAll(query) {
  const result = await ordenRepo.findAll(query);
  return {
    ordenes: result.rows,
    meta: buildPaginationMeta(result.count, result.page, result.limit),
  };
}

async function getOne(id) {
  const orden = await ordenRepo.findById(id);
  if (!orden) throw ApiError.notFound('Orden no encontrada.');
  return orden;
}

/**
 * Recibe el carrito del cliente, verifica precios actuales y stock en DB,
 * calcula el total y crea la orden.
 * 
 * items = [{ product_id: 1, quantity: 2 }, ...]
 */
async function create(data, items) {
  let total = 0;
  const itemsData = [];

  for (const item of items) {
    const producto = await Producto.findByPk(item.product_id);

    if (!producto || !producto.is_active) {
      throw ApiError.badRequest(`El producto con ID ${item.product_id} no existe o no está disponible.`);
    }

    if (producto.stock < item.quantity) {
      throw ApiError.badRequest(`Stock insuficiente para el producto: ${producto.nombre}. Disponibles: ${producto.stock}.`);
    }

    const subtotal = Number(producto.precio) * item.quantity;
    total += subtotal;

    itemsData.push({
      product_id: producto.id,
      product_name: producto.nombre,     // Snapshot
      product_price: producto.precio,    // Snapshot
      quantity: item.quantity,
      subtotal,
    });
  }

  const ordenData = {
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email || null,
    notes: data.notes || null,
    total,
    status: 'pending',
  };

  const orden = await ordenRepo.createWithTransaction(ordenData, itemsData);

  // Generar link de WhatsApp
  const mensajeWA = generarMensajeWhatsApp(orden);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWA)}`;

  return { orden, whatsappUrl };
}

async function updateStatus(id, status) {
  const orden = await ordenRepo.findById(id);
  if (!orden) throw ApiError.notFound('Orden no encontrada.');
  
  const estadosValidos = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!estadosValidos.includes(status)) {
    throw ApiError.badRequest('Estado inválido.');
  }

  return ordenRepo.updateStatus(orden, status);
}

function generarMensajeWhatsApp(orden) {
  let msg = `Hola! Vengo de la tienda online. Quiero confirmar mi pedido #${orden.id}.\n\n`;
  msg += `*Datos del pedido:*\n`;
  msg += `Nombre: ${orden.customer_name}\n`;
  
  orden.items.forEach(item => {
    msg += `- ${item.quantity}x ${item.product_name} ($${item.product_price})\n`;
  });
  
  msg += `\n*Total a abonar: $${orden.total}*\n\n`;
  if (orden.notes) {
    msg += `Notas: ${orden.notes}\n\n`;
  }
  msg += `Espero instrucciones para el pago. Gracias!`;
  
  return msg;
}

module.exports = {
  getAll,
  getOne,
  create,
  updateStatus,
};
