'use strict';

const ordenSvc = require('../services/orden.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * orden.controller.js
 */

async function listar(req, res, next) {
  try {
    const { ordenes, meta } = await ordenSvc.getAll(req.query);
    return ApiResponse.ok(res, 'Órdenes obtenidas.', { ordenes }, meta);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const orden = await ordenSvc.getOne(req.params.id);
    return ApiResponse.ok(res, 'Orden obtenida.', { orden });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { items, ...ordenData } = req.body;
    const result = await ordenSvc.create(ordenData, items);
    
    return ApiResponse.created(res, 'Orden creada correctamente.', {
      orden: result.orden,
      whatsappUrl: result.whatsappUrl
    });
  } catch (err) {
    next(err);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const orden = await ordenSvc.updateStatus(req.params.id, req.body.status);
    return ApiResponse.ok(res, 'Estado actualizado.', { orden });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  cambiarEstado,
};
