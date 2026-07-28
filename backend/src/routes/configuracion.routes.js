'use strict';

const { Router } = require('express');
const ctrl     = require('../controllers/configuracion.controller');
const { verifyToken, anyAdmin } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * Configuracion Routes — /api/configuracion
 *
 * GET  /              → Pública  — obtener toda la configuración
 * GET  /:clave        → Pública  — obtener una clave específica
 * PUT  /              → anyAdmin — actualizar una o más claves
 */

router.get('/', ctrl.obtenerTodo);
router.get('/:clave', ctrl.obtenerClave);
router.put('/', verifyToken, anyAdmin, ctrl.actualizar);

module.exports = router;
