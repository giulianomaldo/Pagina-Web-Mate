'use strict';

require('dotenv').config();

const express  = require('express');
const helmet   = require('helmet');
const cors     = require('cors');
const morgan   = require('morgan');
const cookieParser = require('cookie-parser');

const { validateEnv, server, cors: corsCfg } = require('./config/env');
const errorMiddleware = require('./middlewares/error.middleware');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const xss = require('xss-clean');
const hpp = require('hpp');
const ApiError        = require('./utils/ApiError');

// ── Validar variables de entorno antes de arrancar ────────────────────
validateEnv();

const app = express();

// ── Seguridad ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [corsCfg.clientUrl, 'http://localhost:5173'];
      // Permitir requests sin origin (Postman, mobile apps, server-to-server)
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new ApiError(403, `Origen no permitido por CORS: ${origin}`));
    },
    credentials: true, // cookies httpOnly para refresh token
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Logger HTTP ───────────────────────────────────────────────────────
if (server.isDev) {
  app.use(morgan('dev'));
} else {
  // Formato compacto para producción (compatible con herramientas de log)
  app.use(morgan('combined'));
}

// ── Rate Limiting (Prevención DDoS) ──────────────────────────────────
// Se aplica a todas las rutas. Las rutas de Auth tienen uno más estricto.
app.use(globalLimiter);

// ── Body parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Cookie parser (necesario para leer el refresh token en httpOnly cookie) ──
app.use(cookieParser());

// ── Sanitización y Protección de parámetros ─────────────────────────
// Limpia inyecciones XSS de req.body, req.query y req.params
app.use(xss());

// Previene HTTP Parameter Pollution (HPP) ej: ?sort=asc&sort=desc
app.use(hpp());

// ── Health check ──────────────────────────────────────────────────────
// Ruta pública para monitoreo (Render, Railway, etc.)
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'Encontrarte Infusiones API',
    env:     server.env,
    ts:      new Date().toISOString(),
  });
});

// ── Rutas de la API ───────────────────────────────────────────────────
app.use('/api', require('./routes'));

// ── 404 — rutas no encontradas ────────────────────────────────────────
app.use((_req, _res, next) => {
  next(ApiError.notFound('Ruta no encontrada.'));
});

// ── Manejo global de errores (SIEMPRE AL FINAL) ───────────────────────
app.use(errorMiddleware);

module.exports = app;
