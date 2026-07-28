'use strict';

const { Configuracion } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const ApiError    = require('../utils/ApiError');

/**
 * configuracion.controller.js
 *
 * GET  /api/configuracion         → público, devuelve objeto clave: valor
 * PUT  /api/configuracion         → admin, reemplaza múltiples claves a la vez
 * GET  /api/configuracion/:clave  → público, devuelve una clave
 */

// Claves permitidas para edición desde el panel
const CLAVES_PERMITIDAS = [
  'whatsapp_numero',
  'whatsapp_mensaje',
  'ubicacion',
  'horario_semana',
  'horario_sabado',
  'email',
  'envios_descripcion',
];

// Valores por defecto (se usan para seed y si falta la clave)
const DEFAULTS = {
  whatsapp_numero:    '5491100000000',
  whatsapp_mensaje:   'Hola! Quiero hacer una consulta sobre sus productos 🌿',
  ubicacion:          'Buenos Aires, Argentina',
  horario_semana:     'Lun–Vie: 9:00 a 18:00',
  horario_sabado:     'Sáb: 9:00 a 13:00',
  email:              '',
  envios_descripcion: 'Envíos a todo el país',
};

/**
 * GET /api/configuracion
 * Devuelve todas las claves como objeto { clave: valor }
 */
async function obtenerTodo(req, res, next) {
  try {
    const registros = await Configuracion.findAll();
    const config = { ...DEFAULTS };
    for (const r of registros) {
      config[r.clave] = r.valor;
    }
    return ApiResponse.ok(res, 'Configuración obtenida.', { configuracion: config });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/configuracion/:clave
 * Devuelve el valor de una clave específica
 */
async function obtenerClave(req, res, next) {
  try {
    const { clave } = req.params;
    const registro = await Configuracion.findOne({ where: { clave } });
    const valor = registro ? registro.valor : (DEFAULTS[clave] ?? null);
    return ApiResponse.ok(res, `Clave ${clave} obtenida.`, { clave, valor });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/configuracion
 * Body: { whatsapp_numero: "...", ubicacion: "...", ... }
 * Actualiza (upsert) cada clave enviada en el body.
 * Solo acepta claves de CLAVES_PERMITIDAS.
 */
async function actualizar(req, res, next) {
  try {
    const updates = req.body;

    const invalidKeys = Object.keys(updates).filter(
      (k) => !CLAVES_PERMITIDAS.includes(k),
    );
    if (invalidKeys.length > 0) {
      throw ApiError.badRequest(`Claves no permitidas: ${invalidKeys.join(', ')}`);
    }

    const promises = Object.entries(updates).map(([clave, valor]) =>
      Configuracion.upsert({
        clave,
        valor: valor ?? '',
        descripcion: DEFAULTS[clave] !== undefined ? `Campo: ${clave}` : null,
      }),
    );

    await Promise.all(promises);

    // Devolver configuración actualizada
    const registros = await Configuracion.findAll();
    const config = { ...DEFAULTS };
    for (const r of registros) {
      config[r.clave] = r.valor;
    }

    return ApiResponse.ok(res, 'Configuración actualizada correctamente.', {
      configuracion: config,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  obtenerTodo,
  obtenerClave,
  actualizar,
};
