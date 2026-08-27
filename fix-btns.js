const fs = require('fs');
const files = [
  './frontend/src/pages/Admin/Categorias/AdminCategorias.jsx',
  './frontend/src/pages/Admin/Marcas/AdminMarcas.jsx',
  './frontend/src/pages/Admin/Proveedores/AdminProveedores.jsx',
  './frontend/src/pages/Admin/Banners/AdminBanners.jsx',
  './frontend/src/pages/Admin/Promociones/AdminPromociones.jsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');

  // Regex para el boton Editar
  c = c.replace(
    /<button\s+className=\{[^}]+\}\s+onClick=\{\(\) => openModal\('edit',\s*([^\)]+)\)\}[^>]*>[\s\S]*?Editar[\s\S]*?<\/button>/g,
    '<button className={sharedStyles.actionBtnEdit} onClick={() => openModal(\'edit\', $1)}>✏️ Editar</button>'
  );

  // Regex para el boton Eliminar
  c = c.replace(
    /<button\s+className=\{[^}]+\}\s+onClick=\{\(\) => handleDelete\(([^\)]+)\)\}[^>]*>[\s\S]*?Eliminar[\s\S]*?<\/button>/g,
    '<button className={sharedStyles.actionBtnDelete} onClick={() => handleDelete($1)}>🗑️ Eliminar</button>'
  );

  fs.writeFileSync(f, c);
});

// Update AdminProductos to use sharedStyles instead of styles for these buttons
let p = './frontend/src/pages/Admin/Productos/AdminProductos.jsx';
let pContent = fs.readFileSync(p, 'utf8');
pContent = pContent.replace(/styles\.actionBtnEdit/g, 'sharedStyles.actionBtnEdit');
pContent = pContent.replace(/styles\.actionBtnDelete/g, 'sharedStyles.actionBtnDelete');
pContent = pContent.replace(/>🗑️<\/button>/g, '>🗑️ Eliminar</button>');
fs.writeFileSync(p, pContent);

console.log('Botones actualizados.');
