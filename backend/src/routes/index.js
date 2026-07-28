'use strict';

const { Router } = require('express');

const router = Router();

/**
 * routes/index.js — Router raíz de la API
 *
 * Monta todos los sub-routers bajo /api.
 * Se irán agregando conforme se implementen las fases:
 *
 *   Fase 3 (actual):  /api/auth
 *   Fase 4 pendiente: /api/categorias
 *   Fase 5 pendiente: /api/marcas
 *   Fase 5 pendiente: /api/proveedores
 *   Fase 5 pendiente: /api/productos
 *   Fase 6 pendiente: /api/ordenes
 *   Fase 7 pendiente: /api/banners
 *   Fase 7 pendiente: /api/promociones
 *   Fase 8 pendiente: /api/admins
 */

router.use('/auth',      require('./auth.routes'));
router.use('/productos', require('./producto.routes'));

// Las siguientes líneas se descomentan en cada fase:
router.use('/categorias', require('./categoria.routes'));
router.use('/marcas',     require('./marca.routes'));
router.use('/proveedores',require('./proveedor.routes'));
router.use('/dashboard',  require('./dashboard.routes'));
router.use('/ordenes',    require('./orden.routes'));
router.use('/banners',    require('./banner.routes'));
router.use('/promociones',require('./promocion.routes'));
router.use('/admins',        require('./admin.routes'));
router.use('/configuracion', require('./configuracion.routes'));

module.exports = router;
