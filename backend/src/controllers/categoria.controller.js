'use strict';

const categoriaSvc = require('../services/categoria.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * categoria.controller.js
 */

async function listar(req, res, next) {
  try {
    const isAdmin = !!req.admin;
    const categorias = await categoriaSvc.getAll(req.query, isAdmin);

    return ApiResponse.ok(
      res,
      'Categorías obtenidas correctamente.',
      { categorias },
    );
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const isAdmin = !!req.admin;
    const categoria = await categoriaSvc.getOne(req.params.id, isAdmin);
    return ApiResponse.ok(res, 'Categoría obtenida.', { categoria });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const categoria = await categoriaSvc.create(req.body, req.file);
    return ApiResponse.created(res, 'Categoría creada correctamente.', { categoria });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const categoria = await categoriaSvc.update(req.params.id, req.body, req.file);
    return ApiResponse.ok(res, 'Categoría actualizada correctamente.', { categoria });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await categoriaSvc.destroy(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}

async function activar(req, res, next) {
  try {
    const categoria = await categoriaSvc.activar(req.params.id);
    return ApiResponse.ok(res, 'Categoría activada.', { categoria });
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    const categoria = await categoriaSvc.desactivar(req.params.id);
    return ApiResponse.ok(res, 'Categoría desactivada.', { categoria });
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
