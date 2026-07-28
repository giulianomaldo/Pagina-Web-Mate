'use strict';

/**
 * Validación de variables de entorno obligatorias al arrancar.
 * Si alguna falta, el proceso muere con un mensaje claro.
 */

const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌  Variables de entorno faltantes:');
    missing.forEach((key) => console.error(`    - ${key}`));
    console.error('\n💡  Copiá .env.example a .env y completá los valores.\n');
    process.exit(1);
  }
}

module.exports = {
  validateEnv,

  server: {
    port:    parseInt(process.env.PORT, 10) || 3000,
    env:     process.env.NODE_ENV || 'development',
    isDev:   process.env.NODE_ENV !== 'production',
  },

  db: {
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10) || 3306,
    name:     process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS || '',
  },

  jwt: {
    secret:             process.env.JWT_SECRET,
    expiresIn:          process.env.JWT_EXPIRES_IN          || '15m',
    refreshSecret:      process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn:   process.env.JWT_REFRESH_EXPIRES_IN  || '7d',
  },

  cloudinary: {
    cloudName:  process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:     process.env.CLOUDINARY_API_KEY,
    apiSecret:  process.env.CLOUDINARY_API_SECRET,
  },

  cors: {
    clientUrl: process.env.CLIENT_URL,
  },
};
