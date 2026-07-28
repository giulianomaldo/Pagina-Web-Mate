'use strict';

const adminSvc = require('../services/admin.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * admin.controller.js
 */

async function listar(req, res, next) {
  try {
    const admins = await adminSvc.getAll(req.query);
    return ApiResponse.ok(res, 'Administradores obtenidos.', { admins });
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const admin = await adminSvc.getOne(req.params.id);
    return ApiResponse.ok(res, 'Administrador obtenido.', { admin });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const admin = await adminSvc.create(req.body);
    return ApiResponse.created(res, 'Administrador creado.', { admin });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const admin = await adminSvc.update(req.params.id, req.body);
    return ApiResponse.ok(res, 'Administrador actualizado.', { admin });
  } catch (err) {
    next(err);
  }
}

async function activar(req, res, next) {
  try {
    const admin = await adminSvc.activar(req.params.id);
    return ApiResponse.ok(res, 'Administrador activado.', { admin });
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    // req.admin.id viene del JWT (auth.middleware)
    const admin = await adminSvc.desactivar(req.params.id, req.admin.id);
    return ApiResponse.ok(res, 'Administrador desactivado.', { admin });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  activar,
  desactivar,
};
