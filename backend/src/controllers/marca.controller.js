'use strict';

const marcaSvc = require('../services/marca.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * marca.controller.js
 */

async function listar(req, res, next) {
  try {
    const isAdmin = !!req.admin;
    const marcas = await marcaSvc.getAll(req.query, isAdmin);

    return ApiResponse.ok(
      res,
      'Marcas obtenidas correctamente.',
      { marcas },
    );
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const isAdmin = !!req.admin;
    const marca = await marcaSvc.getOne(req.params.id, isAdmin);
    return ApiResponse.ok(res, 'Marca obtenida.', { marca });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const marca = await marcaSvc.create(req.body, req.file);
    return ApiResponse.created(res, 'Marca creada correctamente.', { marca });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const marca = await marcaSvc.update(req.params.id, req.body, req.file);
    return ApiResponse.ok(res, 'Marca actualizada correctamente.', { marca });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await marcaSvc.destroy(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}

async function activar(req, res, next) {
  try {
    const marca = await marcaSvc.activar(req.params.id);
    return ApiResponse.ok(res, 'Marca activada.', { marca });
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    const marca = await marcaSvc.desactivar(req.params.id);
    return ApiResponse.ok(res, 'Marca desactivada.', { marca });
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
};
