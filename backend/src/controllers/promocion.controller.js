'use strict';

const promocionSvc = require('../services/promocion.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * promocion.controller.js
 */

async function listar(req, res, next) {
  try {
    const { promociones, meta } = await promocionSvc.getAll(req.query);
    return ApiResponse.ok(res, 'Promociones obtenidas.', { promociones }, meta);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const promocion = await promocionSvc.getOne(req.params.id);
    return ApiResponse.ok(res, 'Promoción obtenida.', { promocion });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { productos_ids, ...data } = req.body;
    const promocion = await promocionSvc.create(data, productos_ids, req.admin.id);
    return ApiResponse.created(res, 'Promoción creada.', { promocion });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { productos_ids, ...data } = req.body;
    const promocion = await promocionSvc.update(req.params.id, data, productos_ids);
    return ApiResponse.ok(res, 'Promoción actualizada.', { promocion });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await promocionSvc.destroy(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}

async function activar(req, res, next) {
  try {
    const promocion = await promocionSvc.activar(req.params.id);
    return ApiResponse.ok(res, 'Promoción activada.', { promocion });
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    const promocion = await promocionSvc.desactivar(req.params.id);
    return ApiResponse.ok(res, 'Promoción desactivada.', { promocion });
  } catch (err) {
    next(err);
  }
}

async function validarCupon(req, res, next) {
  try {
    const { nombre, items } = req.body;
    const resultado = await promocionSvc.validarYCalcular(nombre, items);
    return ApiResponse.ok(res, 'Cupón aplicado.', resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  activar,
  desactivar,
  validarCupon,
};
