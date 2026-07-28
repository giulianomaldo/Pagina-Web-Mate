'use strict';

const cloudinarySDK = require('cloudinary').v2;
const { cloudinary: cfg } = require('./env');

/**
 * Configura el SDK de Cloudinary con las credenciales del .env.
 * Solo se configura si las credenciales existen (evita crashes en dev sin cuenta).
 */
if (cfg.cloudName && cfg.apiKey && cfg.apiSecret) {
  cloudinarySDK.config({
    cloud_name: cfg.cloudName,
    api_key:    cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure:     true,
  });

  console.log('☁️   Cloudinary configurado.');
} else {
  console.warn('⚠️   Cloudinary no configurado — variables de entorno faltantes.');
}

module.exports = cloudinarySDK;
