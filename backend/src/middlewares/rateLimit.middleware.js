'use strict';

const rateLimit = require('express-rate-limit');

/**
 * rateLimit.middleware.js
 *
 * Configuración de limitadores de peticiones para prevenir
 * ataques de fuerza bruta (Brute Force) y denegación de servicio (DDoS).
 */

// ── Rate Limit Global ─────────────────────────────────────────────────
// Aplica a la mayoría de las rutas de la API.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,                 // Límite de 300 peticiones por IP cada 15 min
  standardHeaders: true,    // Retorna info de rate limit en los headers `RateLimit-*`
  legacyHeaders: false,     // Desactiva los headers `X-RateLimit-*`
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos.'
  }
});

// ── Rate Limit Estricto (Auth) ────────────────────────────────────────
// Aplica a los endpoints sensibles como login o refresh tokens.
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,                  // Límite de 20 intentos de autenticación por IP cada hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación desde esta IP, bloqueada por 1 hora.'
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
};
