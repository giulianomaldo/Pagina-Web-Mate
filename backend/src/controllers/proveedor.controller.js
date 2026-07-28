'use strict';

const proveedorSvc = require('../services/proveedor.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * proveedor.controller.js
 */

async function listar(req, res, next) {
  try {
    const proveedores = await proveedorSvc.getAll(req.query);

    return ApiResponse.ok(
      res,
      'Proveedores obtenidos correctamente.',
      { proveedores },
    );
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const proveedor = await proveedorSvc.getOne(req.params.id);
    return ApiResponse.ok(res, 'Proveedor obtenido.', { proveedor });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const proveedor = await proveedorSvc.create(req.body);
    return ApiResponse.created(res, 'Proveedor creado correctamente.', { proveedor });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const proveedor = await proveedorSvc.update(req.params.id, req.body);
    return ApiResponse.ok(res, 'Proveedor actualizado correctamente.', { proveedor });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await proveedorSvc.destroy(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}

async function activar(req, res, next) {
  try {
    const proveedor = await proveedorSvc.activar(req.params.id);
    return ApiResponse.ok(res, 'Proveedor activado.', { proveedor });
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    const proveedor = await proveedorSvc.desactivar(req.params.id);
    return ApiResponse.ok(res, 'Proveedor desactivado.', { proveedor });
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
