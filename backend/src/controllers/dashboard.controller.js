'use strict';

const dashboardSvc = require('../services/dashboard.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * dashboard.controller.js
 */

async function obtenerEstadisticas(req, res, next) {
  try {
    const stats = await dashboardSvc.getStats();

    return ApiResponse.ok(
      res,
      'Estadísticas del dashboard obtenidas correctamente.',
      stats,
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  obtenerEstadisticas,
};
