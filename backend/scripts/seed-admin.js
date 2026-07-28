'use strict';

/**
 * scripts/seed-admin.js
 *
 * Crea un usuario administrador inicial en la base de datos.
 * Uso: node scripts/seed-admin.js
 *
 * Si el email ya existe, actualiza la contraseña y reactiva la cuenta.
 */

require('dotenv').config();

const { connectDB }        = require('../src/config/database');
const { UsuarioAdministrador } = require('../src/models');

// ── Datos del admin a crear ────────────────────────────────────────────
const ADMIN = {
  nombre:        'admin123',
  email:         'admin123@encontrarte.com',
  password_hash: '123',          // Se hashea automáticamente via beforeCreate hook
  rol:           'superadmin',
  is_active:     true,
};
// ──────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await connectDB();

    const [admin, created] = await UsuarioAdministrador.findOrCreate({
      where: { email: ADMIN.email },
      defaults: ADMIN,
    });

    if (!created) {
      // Ya existe → actualizar contraseña y reactivar
      admin.set('password_hash', ADMIN.password_hash);
      admin.nombre    = ADMIN.nombre;
      admin.rol       = ADMIN.rol;
      admin.is_active = true;
      await admin.save();
      console.log(`\n✅  Admin actualizado:`);
    } else {
      console.log(`\n✅  Admin creado exitosamente:`);
    }

    console.log(`   Nombre  : ${admin.nombre}`);
    console.log(`   Email   : ${admin.email}`);
    console.log(`   Rol     : ${admin.rol}`);
    console.log(`   Password: ${ADMIN.password_hash}  (guardada hasheada en DB)`);
    console.log(`\n🔐  Podés ingresar al panel en: http://localhost:5173/admin/login\n`);

    process.exit(0);
  } catch (err) {
    console.error('\n❌  Error al crear el admin:');
    console.error('   ', err.message);
    if (err.original) console.error('    DB:', err.original.message);
    if (err.errors) {
      err.errors.forEach((e) => console.error('   •', e.message));
    }
    console.error('\n   Stack:', err.stack);
    process.exit(1);
  }
}

seed();
