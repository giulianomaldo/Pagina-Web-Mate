/**
 * Formatea un número como moneda argentina (ARS)
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);

/**
 * Genera el mensaje de WhatsApp a partir de los items del carrito
 */
export const generarMensajeWhatsApp = (items, total) => {
  const lineas = items.map((item) => {
    const emoji = emojiPorCategoria(item.categoria);
    return `${emoji} ${item.nombre}\nCantidad: ${item.cantidad}\nPrecio: ${formatCurrency(item.precio * item.cantidad)}`;
  });

  const mensaje = [
    'Hola! 👋',
    '',
    'Quiero realizar el siguiente pedido:',
    '',
    '------------------------',
    '',
    lineas.join('\n\n'),
    '',
    '------------------------',
    '',
    `Subtotal: ${formatCurrency(total)}`,
    `Total: ${formatCurrency(total)}`,
    '',
    'Muchas gracias 🌿',
  ].join('\n');

  return encodeURIComponent(mensaje);
};

/**
 * Devuelve un emoji según la categoría del producto
 */
export const emojiPorCategoria = (categoria) => {
  const emojis = {
    mates:     '🧉',
    blends:    '🫖',
    yerbas:    '🌿',
    termos:    '🥤',
    bombillas: '🥄',
  };
  return emojis[categoria] ?? '📦';
};

/**
 * Aplica filtros y ordenamiento a la lista de productos
 */
export const filtrarProductos = (productos, { busqueda, categoria, marcas, precioMin, precioMax, soloStock, orden }) => {
  let resultado = [...productos];

  if (busqueda) {
    const q = busqueda.toLowerCase();
    resultado = resultado.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.tipo.toLowerCase().includes(q)
    );
  }

  if (categoria) {
    resultado = resultado.filter((p) => p.categoria === categoria);
  }

  if (marcas && marcas.length > 0) {
    resultado = resultado.filter((p) => marcas.includes(p.marca));
  }

  if (precioMin !== '' && precioMin !== undefined) {
    resultado = resultado.filter((p) => p.precio >= Number(precioMin));
  }

  if (precioMax !== '' && precioMax !== undefined) {
    resultado = resultado.filter((p) => p.precio <= Number(precioMax));
  }

  if (soloStock) {
    resultado = resultado.filter((p) => p.stock > 0);
  }

  switch (orden) {
    case 'precio-asc':   resultado.sort((a, b) => a.precio - b.precio);                      break;
    case 'precio-desc':  resultado.sort((a, b) => b.precio - a.precio);                      break;
    case 'nombre-asc':   resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));         break;
    case 'nombre-desc':  resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));         break;
    case 'mas-vendidos': resultado.sort((a, b) => (b.masVendido ? 1 : 0) - (a.masVendido ? 1 : 0)); break;
    case 'nuevos':       resultado.sort((a, b) => (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0));   break;
    default:             resultado.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
  }

  return resultado;
};
