'use strict';

/**
 * Validación de variables de entorno obligatorias al arrancar.
 * Si alguna falta, el proceso muere con un mensaje claro.
 */

const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
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
    // URL de conexión completa (Postgres/Supabase)
    url:      process.env.DB_URL,
    // SQLite (por defecto)
    storage:  process.env.DB_STORAGE || null,
  },

  jwt: {
    secret:             process.env.JWT_SECRET,
    expiresIn:          process.env.JWT_EXPIRES_IN          || '15m',
    refreshSecret:      process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn:   process.env.JWT_REFRESH_EXPIRES_IN  || '7d',
  },

  supabase: {
    url:    process.env.SUPABASE_URL,
    key:    process.env.SUPABASE_KEY,
    bucket: process.env.SUPABASE_BUCKET || 'encontrarte',
  },

  cors: {
    clientUrl: process.env.CLIENT_URL,
  },
};
