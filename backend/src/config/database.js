'use strict';

const path      = require('path');
const { Sequelize } = require('sequelize');
const { db, server } = require('./env');

// El archivo de la BD se guarda en la raíz del backend
const dbStorage = db.storage || path.join(__dirname, '..', '..', 'database.sqlite');

const sequelize = new Sequelize({
  dialect:  'sqlite',
  storage:  dbStorage,

  logging: server.isDev
    ? (sql) => console.log(`\n📦  [Sequelize] ${sql}\n`)
    : false,

  define: {
    underscored:     true,
    freezeTableName: false,
    timestamps:      true,
  },
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
