'use strict';

const { Sequelize } = require('sequelize');
const { db, server } = require('./env');

const sequelize = new Sequelize(db.name, db.user, db.password, {
  host:     db.host,
  port:     db.port,
  dialect:  'mysql',

  logging: server.isDev
    ? (sql) => console.log(`\n📦  [Sequelize] ${sql}\n`)
    : false,

  pool: {
    max:     10,   // conexiones simultáneas máximas
    min:     0,
    acquire: 30000, // ms para obtener conexión antes de lanzar error
    idle:    10000, // ms en que una conexión inactiva se libera al pool
  },

  define: {
    underscored:    true,   // snake_case en columnas automáticamente
    freezeTableName: false, // Sequelize pluraliza el nombre del modelo
    timestamps:     true,   // createdAt / updatedAt automáticos
  },

  timezone: '-03:00', // Argentina
});

/**
 * Prueba la conexión y sincroniza los modelos.
 * alter: true actualiza la estructura sin destruir datos (dev).
 * En producción usar migraciones con sequelize-cli.
 */
async function connectDB() {
  await sequelize.authenticate();
  console.log('✅  MySQL conectado.');

  if (server.isDev) {
    await sequelize.sync({ alter: true });
    console.log('🔄  Modelos sincronizados (alter).');
  }
}

module.exports = { sequelize, connectDB };
