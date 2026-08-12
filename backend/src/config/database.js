'use strict';

const path      = require('path');
const { Sequelize } = require('sequelize');
const { db, server } = require('./env');

// El archivo de la BD se guarda en la raíz del backend
const dbStorage = db.storage || path.join(__dirname, '..', '..', 'database.sqlite');

const sequelize = new Sequelize({
  dialect:  'sqlite',
  storage:  dbStorage,
  logging:  false, // silencioso — el alter:true generaba miles de líneas de log

  define: {
    underscored:     true,
    freezeTableName: false,
    timestamps:      true,
  },
});

/**
 * Prueba la conexión y sincroniza los modelos.
 * force: false  → crea tablas si no existen, sin tocar las que ya tienen datos.
 * SQLite no soporta ALTER TABLE real (Sequelize lo simula con backup tables
 * lo que rompe con datos existentes y foreign keys).
 */
async function connectDB() {
  await sequelize.authenticate();
  console.log('✅  Base de datos SQLite conectada.');

  await sequelize.sync({ force: false });
  console.log('🔄  Modelos sincronizados.');
}

module.exports = { sequelize, connectDB };

