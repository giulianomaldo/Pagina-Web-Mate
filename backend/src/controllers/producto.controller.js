'use strict';

const productoSvc = require('../services/producto.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * producto.controller.js
 *
 * Capa HTTP: parsea req, llama al servicio, formatea la respuesta.
 * No contiene lógica de negocio — toda está en producto.service.js.
 */

// ── GET /api/productos ────────────────────────────────────────────────

/**
 * Lista productos con filtros y paginación.
 * Admins pueden ver inactivos con ?includeInactive=true.
 */
async function listar(req, res, next) {
  try {
    const isAdmin = !!req.admin;
    const { rows, meta } = await productoSvc.getAll(req.query, isAdmin);

    return ApiResponse.ok(
      res,
      'Productos obtenidos correctamente.',
      { productos: rows },
      meta,
    );
  } catch (err) {
    next(err);
  }
}

// ── GET /api/productos/:id ────────────────────────────────────────────

/**
 * Obtiene un producto por ID o slug.
 * :id puede ser un número (ID) o un string (slug).
 */
async function obtener(req, res, next) {
  try {
    const isAdmin  = !!req.admin;
    const producto = await productoSvc.getOne(req.params.id, isAdmin);
    return ApiResponse.ok(res, 'Producto obtenido.', { producto });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/productos ───────────────────────────────────────────────

async function crear(req, res, next) {
  try {
    const producto = await productoSvc.create(req.body, req.files || {});
    return ApiResponse.created(res, 'Producto creado correctamente.', { producto });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/productos/:id ────────────────────────────────────────────

async function actualizar(req, res, next) {
  try {
    const producto = await productoSvc.update(
      req.params.id,
      req.body,
      req.files || {},
    );
    return ApiResponse.ok(res, 'Producto actualizado correctamente.', { producto });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/productos/:id ─────────────────────────────────────────

/**
 * Eliminación permanente (hard delete). Solo superadmin.
 * Elimina también las imágenes de Cloudinary.
 * Para ocultarlo de la tienda sin eliminarlo, usar PATCH /desactivar.
 */
async function eliminar(req, res, next) {
  try {
    await productoSvc.destroy(req.params.id);
    return ApiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/productos/:id/stock ────────────────────────────────────

async function cambiarStock(req, res, next) {
  try {
    const producto = await productoSvc.cambiarStock(req.params.id, req.body.stock);
    return ApiResponse.ok(res, `Stock actualizado a ${producto.stock}.`, { producto });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/productos/:id/precio ──────────────────────────────────

async function cambiarPrecio(req, res, next) {
  try {
    const producto = await productoSvc.cambiarPrecio(req.params.id, req.body.precio);
    return ApiResponse.ok(res, `Precio actualizado a $${producto.precio}.`, { producto });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/productos/:id/activar ─────────────────────────────────

async function activar(req, res, next) {
  try {
    const producto = await productoSvc.activar(req.params.id);
    return ApiResponse.ok(res, 'Producto activado.', { producto });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/productos/:id/desactivar ──────────────────────────────

async function desactivar(req, res, next) {
  try {
    const producto = await productoSvc.desactivar(req.params.id);
    return ApiResponse.ok(res, 'Producto desactivado.', { producto });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/productos/:id/destacado ───────────────────────────────

async function toggleDestacado(req, res, next) {
  try {
    const producto = await productoSvc.toggleDestacado(req.params.id);
    const estado   = producto.is_destacado ? 'marcado como destacado' : 'removido de destacados';
    return ApiResponse.ok(res, `Producto ${estado}.`, { producto });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/productos/:id/nuevo ───────────────────────────────────

async function toggleNuevo(req, res, next) {
  try {
    const producto = await productoSvc.toggleNuevo(req.params.id);
    const estado   = producto.is_nuevo ? 'marcado como nuevo' : 'removido de nuevos';
    return ApiResponse.ok(res, `Producto ${estado}.`, { producto });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/productos/:id/mas-vendido ──────────────────────────────

async function toggleMasVendido(req, res, next) {
  try {
    const producto = await productoSvc.toggleMasVendido(req.params.id);
    const estado   = producto.is_mas_vendido ? 'marcado como más vendido' : 'removido de más vendidos';
    return ApiResponse.ok(res, `Producto ${estado}.`, { producto });
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
  cambiarStock,
  cambiarPrecio,
  activar,
  desactivar,
  toggleDestacado,
  toggleNuevo,
  toggleMasVendido,
};
