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
  
  // Extraemos el modal content
  const modalRegex = /\{modalOpen && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>([\s\S]*?)<\/div>\s*<\/div>\s*\)\}/;
  const match = c.match(modalRegex);
  
  if (match) {
    let innerModal = match[1];
    
    let titleMatch = innerModal.match(/<h2[^>]*>(.*?)<\/h2>/);
    let title = titleMatch ? titleMatch[1] : '{formData.id ? "✏️ Editar" : "➕ Nuevo"}';
    
    let formContentRegex = /<form[^>]*>([\s\S]*?)<\/form>/;
    let formMatch = innerModal.match(formContentRegex);
    let formContent = formMatch ? formMatch[1] : '';
    let formTagMatch = innerModal.match(/<form([^>]*)>/);
    let formAttrs = formTagMatch ? formTagMatch[1] : 'onSubmit={handleSave}';
    
    // Extraemos los botones del form
    let footerRegex = /<div className=\{sharedStyles\.modalActions\}>([\s\S]*?)<\/div>/;
    let footerMatch = formContent.match(footerRegex);
    
    if (footerMatch) {
      formContent = formContent.replace(footerMatch[0], '');
    }
    
    const newDrawer = `
            {modalOpen && <div className={sharedStyles.drawerBackdrop} onClick={() => setModalOpen(false)} />}
            <div className={\`\${sharedStyles.drawer} \${modalOpen ? sharedStyles.drawerOpen : ''}\`} style={{ width: '500px' }}>
                <div className={sharedStyles.drawerHeader}>
                    <div className={sharedStyles.drawerTitle}>
                        ${title.includes('id') ? title.replace('Editar', '✏️ Editar').replace('Nueva', '➕ Nueva').replace('Nuevo', '➕ Nuevo') : title}
                        {formData.id && formData.nombre && <span className={sharedStyles.drawerProductName}>— {formData.nombre}</span>}
                    </div>
                    <button type="button" className={sharedStyles.drawerClose} onClick={() => setModalOpen(false)}>×</button>
                </div>
                
                <form ${formAttrs} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto', display: 'block' }}>
                        ${formContent}
                    </div>
                    
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" className={\`\${sharedStyles.btn} \${sharedStyles.btnGhost}\`} onClick={() => setModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className={\`\${sharedStyles.btn} \${sharedStyles.btnPrimary}\`}>
                            {formData.id ? '✅ Guardar Cambios' : '✅ Crear'}
                        </button>
                    </div>
                </form>
            </div>
`;
    
    c = c.replace(modalRegex, newDrawer);
    fs.writeFileSync(f, c);
  } else {
    console.log('No modal found in ' + f);
  }
});
console.log('Modales convertidos a Drawer.');
