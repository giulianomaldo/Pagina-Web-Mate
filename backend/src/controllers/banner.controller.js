'use strict';

const bannerSvc = require('../services/banner.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * banner.controller.js
 */

async function listar(req, res, next) {
  try {
    const isAdmin = !!req.admin;
    const banners = await bannerSvc.getAll(req.query, isAdmin);
    return ApiResponse.ok(res, 'Banners obtenidos.', { banners });
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const banner = await bannerSvc.getOne(req.params.id);
    return ApiResponse.ok(res, 'Banner obtenido.', { banner });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const banner = await bannerSvc.create(req.body, req.file, req.admin.id);
    return ApiResponse.created(res, 'Banner creado.', { banner });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const banner = await bannerSvc.update(req.params.id, req.body, req.file);
    return ApiResponse.ok(res, 'Banner actualizado.', { banner });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await bannerSvc.destroy(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}

async function activar(req, res, next) {
  try {
    const banner = await bannerSvc.activar(req.params.id);
    return ApiResponse.ok(res, 'Banner activado.', { banner });
  } catch (err) {
    next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    const banner = await bannerSvc.desactivar(req.params.id);
    return ApiResponse.ok(res, 'Banner desactivado.', { banner });
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
