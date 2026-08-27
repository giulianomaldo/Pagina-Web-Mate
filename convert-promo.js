const fs = require('fs');
let c = fs.readFileSync('./frontend/src/pages/Admin/Promociones/AdminPromociones.jsx', 'utf8');

const modalRegex = /\{showModal && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>([\s\S]*?)<\/div>\s*<\/div>\s*\)\}/;
const match = c.match(modalRegex);

if (match) {
  let innerModal = match[1];
  
  let titleMatch = innerModal.match(/<h2[^>]*>(.*?)<\/h2>/);
  let title = titleMatch ? titleMatch[1] : '{formData.id ? "✏️ Editar" : "➕ Nuevo"}';
  
  let formContentRegex = /<form[^>]*>([\s\S]*?)<\/form>/;
  let formMatch = innerModal.match(formContentRegex);
  let formContent = formMatch ? formMatch[1] : '';
  let formTagMatch = innerModal.match(/<form([^>]*)>/);
  let formAttrs = formTagMatch ? formTagMatch[1] : 'onSubmit={handleSubmit}';
  
  let footerRegex = /<div className=\{sharedStyles\.formActions\}>([\s\S]*?)<\/div>/;
  let footerMatch = formContent.match(footerRegex);
  
  if (footerMatch) {
    formContent = formContent.replace(footerMatch[0], '');
  }
  
  const newDrawer = `
          {showModal && <div className={sharedStyles.drawerBackdrop} onClick={() => setShowModal(false)} />}
          <div className={\`\${sharedStyles.drawer} \${showModal ? sharedStyles.drawerOpen : ''}\`} style={{ width: '500px' }}>
              <div className={sharedStyles.drawerHeader}>
                  <div className={sharedStyles.drawerTitle}>
                      ${title.includes('id') ? title.replace('Editar', '✏️ Editar').replace('Nueva', '➕ Nueva').replace('Nuevo', '➕ Nuevo') : title}
                      {formData.id && formData.nombre && <span className={sharedStyles.drawerProductName}>— {formData.nombre}</span>}
                  </div>
                  <button type="button" className={sharedStyles.drawerClose} onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <form ${formAttrs} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto', display: 'block' }}>
                      ${formContent}
                  </div>
                  
                  <div className={sharedStyles.drawerFooter}>
                      <button type="button" className={\`\${sharedStyles.btn} \${sharedStyles.btnGhost}\`} onClick={() => setShowModal(false)}>
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
  fs.writeFileSync('./frontend/src/pages/Admin/Promociones/AdminPromociones.jsx', c);
  console.log('Promociones drawer convertido.');
} else {
  console.log('No modal found in Promociones');
}
