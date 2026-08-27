const { sequelize } = require('./src/config/database');
async function run() {
  const [res] = await sequelize.query(`
    SELECT is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'productos' AND column_name = 'marca_id';
  `);
  console.log('Nullable?', res);
  process.exit();
}
run();
