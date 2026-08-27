'use strict';

const path      = require('path');
const { Sequelize } = require('sequelize');
const { db, server } = require('./env');

const dbStorage = db.storage || path.join(__dirname, '..', '..', 'database.sqlite');

const sequelize = db.url
  ? new Sequelize(db.url, {
      dialect: 'postgres',
      logging: server.isDev ? (sql) => console.log(`\n📦  [Sequelize] ${sql}\n`) : false,
      define: {
        underscored: true,
        freezeTableName: false,
        timestamps: true,
      },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: dbStorage,
      logging: server.isDev ? (sql) => console.log(`\n📦  [Sequelize] ${sql}\n`) : false,
      define: {
        underscored: true,
        freezeTableName: false,
        timestamps: true,
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
  console.log('✅  Base de datos (PostgreSQL/SQLite) conectada.');  if (server.isDev) {
    await sequelize.sync({ force: false, alter: { drop: false } });
    console.log('🔄  Modelos sincronizados (alter).');
  }
}

module.exports = { sequelize, connectDB };
