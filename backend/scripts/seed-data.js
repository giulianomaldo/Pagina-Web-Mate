'use strict';

/**
 * scripts/seed-data.js
 *
 * Seed de datos de prueba para el panel de administración.
 * Carga: categorías, marcas, proveedores, productos, banners,
 *        promociones y configuración de contacto.
 *
 * Uso: node scripts/seed-data.js
 * Es idempotente: no duplica si ya existe (usa findOrCreate).
 */

require('dotenv').config();

const { connectDB } = require('../src/config/database');
const {
  Categoria,
  Marca,
  Proveedor,
  Producto,
  Banner,
  Promocion,
  Configuracion,
} = require('../src/models');

// ─── Colores de consola ────────────────────────────────────────────────
const ok  = (msg) => console.log(`  ✅  ${msg}`);
const log = (msg) => console.log(`  📦  ${msg}`);
const sep = ()    => console.log('\n' + '─'.repeat(50));

// ══════════════════════════════════════════════════════════════════════
async function seed() {
  // Conectar sin alter:true para evitar conflictos si el backend está corriendo
  const { sequelize } = require('../src/config/database');
  await sequelize.authenticate();
  console.log('  ✅  Base de datos conectada.\n');

  // ── 1. CATEGORÍAS ────────────────────────────────────────────────────
  log('Creando categorías...');

  const categoriasData = [
    { nombre: 'Mates',      slug: 'mates',      emoji: '🧉', descripcion: 'Mates de todos los materiales y estilos', orden: 1 },
    { nombre: 'Bombillas',  slug: 'bombillas',  emoji: '🥄', descripcion: 'Bombillas de acero, alpaca y madera',      orden: 2 },
    { nombre: 'Termos',     slug: 'termos',     emoji: '🫙', descripcion: 'Termos para mantener el agua caliente',    orden: 3 },
    { nombre: 'Yerbas',     slug: 'yerbas',     emoji: '🌿', descripcion: 'Yerbas tradicionales y especiales',       orden: 4 },
    { nombre: 'Blends',     slug: 'blends',     emoji: '🫖', descripcion: 'Mezclas aromáticas e infusiones',         orden: 5 },
    { nombre: 'Accesorios', slug: 'accesorios', emoji: '🎒', descripcion: 'Soportes, limpiadoras y más',             orden: 6 },
  ];

  const categorias = {};
  for (const cat of categoriasData) {
    const [inst] = await Categoria.findOrCreate({ where: { slug: cat.slug }, defaults: { ...cat, is_active: true } });
    categorias[cat.slug] = inst;
    ok(`Categoría: ${cat.emoji} ${cat.nombre}`);
  }

  // ── 2. MARCAS ─────────────────────────────────────────────────────────
  sep();
  log('Creando marcas...');

  const marcasData = [
    { nombre: 'Yerba Mate Taragüi', slug: 'taragui',   descripcion: 'La yerba mate más vendida de Argentina' },
    { nombre: 'Cruz de Malta',      slug: 'cruz-malta', descripcion: 'Tradición y calidad desde 1874'         },
    { nombre: 'La Merced',          slug: 'la-merced',  descripcion: 'Yerba mate de alta gama'                },
    { nombre: 'Stanley',            slug: 'stanley',    descripcion: 'Termos y accesorios premium'            },
    { nombre: 'Cebador',            slug: 'cebador',    descripcion: 'Mates artesanales argentinos'           },
    { nombre: 'Sin Marca',          slug: 'sin-marca',  descripcion: 'Productos genéricos'                    },
  ];

  const marcas = {};
  for (const m of marcasData) {
    const [inst] = await Marca.findOrCreate({ where: { slug: m.slug }, defaults: { ...m, is_active: true } });
    marcas[m.slug] = inst;
    ok(`Marca: ${m.nombre}`);
  }

  // ── 3. PROVEEDORES ────────────────────────────────────────────────────
  sep();
  log('Creando proveedores...');

  const proveedoresData = [
    {
      nombre: 'Distribuidora Norte S.A.',
      nombre_contacto: 'Juan Pérez',
      email: 'ventas@distrinorte.com.ar',
      telefono: '011-4567-8900',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
      notas: 'Proveedor principal de yerbas. Entrega los martes y jueves.',
    },
    {
      nombre: 'Importadora Sur',
      nombre_contacto: 'María González',
      email: 'compras@impsur.com.ar',
      telefono: '011-3456-7890',
      ciudad: 'La Plata',
      provincia: 'Buenos Aires',
      notas: 'Termos y accesorios importados. Mínimo de compra $50.000.',
    },
    {
      nombre: 'Artesanos del Mate',
      nombre_contacto: 'Carlos Ruiz',
      email: 'contacto@artesanosdelmate.com',
      telefono: '0351-456-7890',
      ciudad: 'Córdoba',
      provincia: 'Córdoba',
      notas: 'Mates artesanales. Producción limitada.',
    },
  ];

  const proveedores = [];
  for (const p of proveedoresData) {
    const [inst] = await Proveedor.findOrCreate({ where: { email: p.email }, defaults: { ...p, is_active: true } });
    proveedores.push(inst);
    ok(`Proveedor: ${p.nombre}`);
  }

  // ── 4. PRODUCTOS ──────────────────────────────────────────────────────
  sep();
  log('Creando productos...');

  const productosData = [
    // YERBAS
    {
      nombre:      'Taragüi Tradicional 1kg',
      slug:        'taragui-tradicional-1kg',
      descripcion: 'La yerba mate más popular de Argentina. Sabor intenso y duradero, ideal para compartir en ronda. Elaborada con hojas seleccionadas de la mejor calidad.',
      precio:      2850,
      precio_costo:1800,
      stock:       45,
      stock_minimo:10,
      tipo:        'yerba',
      peso_gr:     1000,
      is_destacado:true,
      is_nuevo:    false,
      is_mas_vendido: true,
      categoria_id: categorias['yerbas'].id,
      marca_id:    marcas['taragui'].id,
      proveedor_id:proveedores[0].id,
    },
    {
      nombre:      'Cruz de Malta 500g',
      slug:        'cruz-de-malta-500g',
      descripcion: 'Clásica yerba argentina con más de 150 años de historia. Suave, sin palo, con un sabor característico que enamora a los mateadores más exigentes.',
      precio:      1650,
      precio_costo: 900,
      stock:       30,
      stock_minimo:8,
      tipo:        'yerba',
      peso_gr:     500,
      is_destacado:false,
      is_nuevo:    false,
      is_mas_vendido: true,
      categoria_id: categorias['yerbas'].id,
      marca_id:    marcas['cruz-malta'].id,
      proveedor_id:proveedores[0].id,
    },
    {
      nombre:      'La Merced Blend de Yerbas Especial 250g',
      slug:        'la-merced-blend-especial-250g',
      descripcion: 'Blend premium con yerba mate, menta peperita y cedrón. Una experiencia única para los amantes del mate gourmet. Edición limitada.',
      precio:      1890,
      precio_costo:1100,
      stock:       15,
      stock_minimo:5,
      tipo:        'blend',
      peso_gr:     250,
      is_destacado:true,
      is_nuevo:    true,
      is_mas_vendido: false,
      categoria_id: categorias['blends'].id,
      marca_id:    marcas['la-merced'].id,
      proveedor_id:proveedores[0].id,
    },
    // MATES
    {
      nombre:      'Mate Calabaza Curado Natural',
      slug:        'mate-calabaza-curado-natural',
      descripcion: 'Mate de calabaza curada artesanalmente. Viene listo para usar. Ideal para iniciarse en el mundo del mate. Tamaño mediano, perfecta ergonomía.',
      precio:      3200,
      precio_costo:1800,
      stock:       20,
      stock_minimo:5,
      tipo:        'mate',
      peso_gr:     150,
      is_destacado:true,
      is_nuevo:    false,
      is_mas_vendido: false,
      categoria_id: categorias['mates'].id,
      marca_id:    marcas['cebador'].id,
      proveedor_id:proveedores[2].id,
    },
    {
      nombre:      'Mate de Madera Lapacho Tallado',
      slug:        'mate-madera-lapacho-tallado',
      descripcion: 'Mate artesanal tallado a mano en madera de lapacho. Diseño exclusivo con motivos autóctonos. Cada pieza es única. Incluye bombilla de alpaca.',
      precio:      5500,
      precio_costo:3000,
      stock:       8,
      stock_minimo:3,
      tipo:        'mate',
      peso_gr:     200,
      is_destacado:true,
      is_nuevo:    true,
      is_mas_vendido: false,
      categoria_id: categorias['mates'].id,
      marca_id:    marcas['cebador'].id,
      proveedor_id:proveedores[2].id,
    },
    {
      nombre:      'Mate de Acero Inoxidable 350ml',
      slug:        'mate-acero-inoxidable-350ml',
      descripcion: 'Mate de acero inoxidable 304, apto para lavavajillas. Diseño moderno y resistente, ideal para llevar al trabajo o viajes. No altera el sabor de la yerba.',
      precio:      2800,
      precio_costo:1500,
      stock:       25,
      stock_minimo:8,
      tipo:        'mate',
      peso_gr:     180,
      is_destacado:false,
      is_nuevo:    false,
      is_mas_vendido: true,
      categoria_id: categorias['mates'].id,
      marca_id:    marcas['sin-marca'].id,
      proveedor_id:proveedores[1].id,
    },
    // BOMBILLAS
    {
      nombre:      'Bombilla Alpaca Punta Cebra',
      slug:        'bombilla-alpaca-punta-cebra',
      descripcion: 'Bombilla de alpaca plateada con punta cebra. Filtra perfectamente la yerba fina. Resistente y duradera. Largo 18cm.',
      precio:      890,
      precio_costo:450,
      stock:       60,
      stock_minimo:15,
      tipo:        'bombilla',
      peso_gr:     45,
      is_destacado:false,
      is_nuevo:    false,
      is_mas_vendido: true,
      categoria_id: categorias['bombillas'].id,
      marca_id:    marcas['sin-marca'].id,
      proveedor_id:proveedores[1].id,
    },
    {
      nombre:      'Bombilla Acero Inoxidable Flexible',
      slug:        'bombilla-acero-flexible',
      descripcion: 'Bombilla de acero inoxidable 304 con cuello flexible. Apta para lavavajillas. No se oxida. Viene con limpiador incluido.',
      precio:      1200,
      precio_costo: 600,
      stock:       40,
      stock_minimo:10,
      tipo:        'bombilla',
      peso_gr:     55,
      is_destacado:false,
      is_nuevo:    true,
      is_mas_vendido: false,
      categoria_id: categorias['bombillas'].id,
      marca_id:    marcas['sin-marca'].id,
      proveedor_id:proveedores[1].id,
    },
    // TERMOS
    {
      nombre:      'Termo Stanley Classic 1 Litro Verde',
      slug:        'termo-stanley-classic-1-litro-verde',
      descripcion: 'El termo más popular del mundo mateador. Mantiene el agua caliente hasta 24 horas. Acero inoxidable 18/8, libre de BPA. Garantía de por vida.',
      precio:      18900,
      precio_costo:12000,
      stock:       12,
      stock_minimo:3,
      tipo:        'termo',
      peso_gr:     680,
      is_destacado:true,
      is_nuevo:    false,
      is_mas_vendido: true,
      categoria_id: categorias['termos'].id,
      marca_id:    marcas['stanley'].id,
      proveedor_id:proveedores[1].id,
    },
    {
      nombre:      'Termo Económico 1 Litro Acero',
      slug:        'termo-economico-1-litro',
      descripcion: 'Termo de acero inoxidable para uso diario. Mantiene temperatura hasta 8 horas. Ideal para quienes empiezan en el mate.',
      precio:      5500,
      precio_costo:3000,
      stock:       0,
      stock_minimo:5,
      tipo:        'termo',
      peso_gr:     500,
      is_destacado:false,
      is_nuevo:    false,
      is_mas_vendido: false,
      categoria_id: categorias['termos'].id,
      marca_id:    marcas['sin-marca'].id,
      proveedor_id:proveedores[1].id,
    },
    // ACCESORIOS
    {
      nombre:      'Kit Limpieza para Bombilla',
      slug:        'kit-limpieza-bombilla',
      descripcion: 'Set de 3 cepillos de diferentes diámetros para limpiar bombillas. Cerdas de nylon resistentes. Estuche incluido.',
      precio:      650,
      precio_costo:300,
      stock:       3,
      stock_minimo:10,
      tipo:        'accesorio',
      peso_gr:     80,
      is_destacado:false,
      is_nuevo:    false,
      is_mas_vendido: false,
      categoria_id: categorias['accesorios'].id,
      marca_id:    marcas['sin-marca'].id,
      proveedor_id:proveedores[1].id,
    },
    {
      nombre:      'Soporte para Mate Madera de Pino',
      slug:        'soporte-mate-madera-pino',
      descripcion: 'Soporte artesanal de madera de pino para apoyar el mate. Evita que se vuelque. Apto para mates de calibre estándar.',
      precio:      950,
      precio_costo:450,
      stock:       18,
      stock_minimo:5,
      tipo:        'accesorio',
      peso_gr:     120,
      is_destacado:false,
      is_nuevo:    true,
      is_mas_vendido: false,
      categoria_id: categorias['accesorios'].id,
      marca_id:    marcas['cebador'].id,
      proveedor_id:proveedores[2].id,
    },
  ];

  for (const p of productosData) {
    const [inst, created] = await Producto.findOrCreate({
      where: { slug: p.slug },
      defaults: { ...p, is_active: true },
    });
    const icon = p.stock === 0 ? '🔴' : p.stock <= p.stock_minimo ? '🟡' : '🟢';
    ok(`${icon} Producto: ${p.nombre} (stock: ${p.stock})`);
  }

  // ── 5. BANNERS ────────────────────────────────────────────────────────
  sep();
  log('Creando banners...');

  const bannersData = [
    {
      titulo:     '¡Nueva temporada de mates artesanales!',
      subtitulo:  'Descubrí nuestra colección exclusiva de mates tallados a mano',
      imagen_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&q=80',
      link_url:   '/productos?categoria=mates',
      link_label: 'Ver colección',
      posicion:   'hero',
      orden:      1,
      is_active:  true,
    },
    {
      titulo:     '20% OFF en yerbas seleccionadas',
      subtitulo:  'Solo por tiempo limitado en toda la línea Taragüi y Cruz de Malta',
      imagen_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&q=80',
      link_url:   '/productos?categoria=yerbas',
      link_label: 'Aprovechar oferta',
      posicion:   'hero',
      orden:      2,
      is_active:  true,
    },
    {
      titulo:     'Envío gratis en compras mayores a $10.000',
      subtitulo:  'A todo el país — Comprá hoy y recibí en 48hs',
      imagen_url: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=1200&q=80',
      link_url:   '/productos',
      link_label: 'Comprar ahora',
      posicion:   'mid',
      orden:      1,
      is_active:  true,
    },
  ];

  for (const b of bannersData) {
    const [, created] = await Banner.findOrCreate({ where: { titulo: b.titulo }, defaults: b });
    ok(`Banner: "${b.titulo}" (${b.posicion})`);
  }

  // ── 6. PROMOCIONES ────────────────────────────────────────────────────
  sep();
  log('Creando promociones...');

  const hoy = new Date();
  const en30 = new Date(hoy); en30.setDate(en30.getDate() + 30);
  const en7  = new Date(hoy); en7.setDate(en7.getDate() + 7);

  const promocionesData = [
    {
      nombre:          'Bienvenida 15%',
      descripcion:     'Descuento de bienvenida para nuevos clientes. Aplicable a toda la tienda.',
      tipo_descuento:  'porcentaje',
      valor_descuento: 15,
      compra_minima:   0,
      usos_maximos:    100,
      usos_actuales:   0,
      aplica_a:        'todos',
      fecha_inicio:    hoy,
      fecha_fin:       en30,
      is_active:       true,
    },
    {
      nombre:          'Yerbas 2x1 fin de semana',
      descripcion:     'En todas las yerbas — válido solo este fin de semana.',
      tipo_descuento:  'porcentaje',
      valor_descuento: 50,
      compra_minima:   1000,
      usos_maximos:    50,
      usos_actuales:   0,
      aplica_a:        'categoria',
      fecha_inicio:    hoy,
      fecha_fin:       en7,
      is_active:       true,
    },
    {
      nombre:          '$500 de descuento en termos',
      descripcion:     'Descuento fijo de $500 en cualquier termo de la tienda.',
      tipo_descuento:  'monto_fijo',
      valor_descuento: 500,
      compra_minima:   3000,
      usos_maximos:    30,
      usos_actuales:   0,
      aplica_a:        'todos',
      fecha_inicio:    hoy,
      fecha_fin:       en30,
      is_active:       false,  // inactiva — para testear el toggle
    },
  ];

  for (const promo of promocionesData) {
    const [, created] = await Promocion.findOrCreate({ where: { nombre: promo.nombre }, defaults: promo });
    const estado = promo.is_active ? '🟢' : '⚫';
    ok(`${estado} Promoción: ${promo.nombre} (${promo.tipo_descuento === 'porcentaje' ? promo.valor_descuento + '%' : '$' + promo.valor_descuento})`);
  }

  // ── 7. CONFIGURACIÓN DE CONTACTO ──────────────────────────────────────
  sep();
  log('Cargando configuración de contacto...');

  const configs = [
    { clave: 'whatsapp_numero',    valor: '5491134567890' },
    { clave: 'whatsapp_mensaje',   valor: 'Hola! Vi su tienda y quiero hacer una consulta 🧉' },
    { clave: 'ubicacion',          valor: 'Av. Corrientes 1234, CABA, Buenos Aires' },
    { clave: 'horario_semana',     valor: 'Lun–Vie: 9:00 a 18:00' },
    { clave: 'horario_sabado',     valor: 'Sáb: 9:00 a 13:00' },
    { clave: 'email',              valor: 'contacto@encontrarte.com' },
    { clave: 'envios_descripcion', valor: 'Envíos a todo el país en 24-72hs' },
  ];

  for (const cfg of configs) {
    await Configuracion.findOrCreate({ where: { clave: cfg.clave }, defaults: cfg });
    ok(`Config: ${cfg.clave} = "${cfg.valor}"`);
  }

  // ── RESUMEN ────────────────────────────────────────────────────────────
  sep();
  console.log('  🎉  Seed completado exitosamente!\n');
  console.log('  📊  Resumen:');
  console.log(`       Categorías : ${categoriasData.length}`);
  console.log(`       Marcas     : ${marcasData.length}`);
  console.log(`       Proveedores: ${proveedoresData.length}`);
  console.log(`       Productos  : ${productosData.length} (1 sin stock, 1 con stock bajo)`);
  console.log(`       Banners    : ${bannersData.length}`);
  console.log(`       Promociones: ${promocionesData.length} (1 inactiva para testear)`);
  console.log(`       Config     : ${configs.length} claves`);
  sep();
  console.log('  🔐  Panel admin: http://localhost:5173/admin/login');
  console.log('  🛒  Tienda:      http://localhost:5173\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌  Error en seed:', err.message);
  if (err.original) console.error('   DB:', err.original.message);
  if (err.errors) err.errors.forEach(e => console.error('   Validation:', e.path, '-', e.message));
  console.error(err.stack);
  process.exit(1);
});
