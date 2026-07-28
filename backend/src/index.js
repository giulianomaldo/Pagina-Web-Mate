'use strict';

const app            = require('./app');
const { connectDB }  = require('./config/database');
const { server }     = require('./config/env');

/**
 * Arranca el servidor solo después de que la DB esté lista.
 * Si la conexión falla, el proceso muere con el error (no arrancamos sin DB).
 */
async function start() {
  try {
    // 1. Conectar a MySQL
    await connectDB();

    // 2. Escuchar en el puerto configurado
    app.listen(server.port, () => {
      console.log(`\n🚀  Servidor corriendo en http://localhost:${server.port}`);
      console.log(`📋  Entorno: ${server.env}`);
      console.log(`🏥  Health: http://localhost:${server.port}/health\n`);
    });

  } catch (err) {
    console.error('❌  Error al iniciar el servidor:');
    console.error('   ', err.message);
    if (err.original) console.error('    DB:', err.original.message);
    process.exit(1);
  }
}

// ── Manejo de errores no capturados ───────────────────────────────────

process.on('uncaughtException', (err) => {
  console.error('💥  uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥  unhandledRejection:', reason);
  process.exit(1);
});

start();
