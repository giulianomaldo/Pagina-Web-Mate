const fs = require('fs');

function convertToDrawer(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  c = c.replace(/<div className=\{sharedStyles\.modalOverlay\}>\s*<div className=\{sharedStyles\.modal\}>\s*<h2[^>]*>(.*?)<\/h2>/,
  `<div className={sharedStyles.drawerBackdrop} onClick={() => typeof setModalOpen === 'function' ? setModalOpen(false) : setShowModal(false)} />
        <div className={\`\${sharedStyles.drawer} \${(typeof modalOpen !== 'undefined' ? modalOpen : showModal) ? sharedStyles.drawerOpen : ''}\`} style={{ width: '500px' }}>
            <div className={sharedStyles.drawerHeader}>
                <div className={sharedStyles.drawerTitle}>
                    $1
                </div>
                <button type="button" className={sharedStyles.drawerClose} onClick={() => typeof setModalOpen === 'function' ? setModalOpen(false) : setShowModal(false)}>×</button>
            </div>
            <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
  `);
  
  c = c.replace(/<div className=\{sharedStyles\.modalActions\}>/, 
  `</div>
            <div className={sharedStyles.drawerFooter}>`);
            
  c = c.replace(/<\/form>\s*<\/div>\s*<\/div>\s*\)\}/, 
  `</form></div>)}`);

  fs.writeFileSync(file, c);
}

convertToDrawer('./frontend/src/pages/Admin/Marcas/AdminMarcas.jsx');
convertToDrawer('./frontend/src/pages/Admin/Proveedores/AdminProveedores.jsx');
convertToDrawer('./frontend/src/pages/Admin/Banners/AdminBanners.jsx');
convertToDrawer('./frontend/src/pages/Admin/Promociones/AdminPromociones.jsx');
console.log('Conversion completed.');
