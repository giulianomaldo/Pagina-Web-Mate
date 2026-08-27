const fs = require('fs');
function replaceModal(file) {
  let c = fs.readFileSync(file, 'utf8');
  const modalRegex = /\{modalOpen && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>([\s\S]*?)<\/div>\s*<\/div>\s*\)\}/;
  if(!modalRegex.test(c)) return;
  
  c = c.replace(/\{modalOpen && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>\s*<div className=\{sharedStyles\.modal\}>\s*<h2[^>]*>(.*?)<\/h2>\s*<form onSubmit=\{([^}]+)\}>/, 
  `{modalOpen && <div className={sharedStyles.drawerBackdrop} onClick={() => setModalOpen(false)} />}
            <div className={\`\${sharedStyles.drawer} \${modalOpen ? sharedStyles.drawerOpen : ''}\`}>
                <div className={sharedStyles.drawerHeader}>
                    <div className={sharedStyles.drawerTitle}>
                        {formData.id ? '✏️ Editar' : '➕ Nuevo'}
                        {formData.id && <span className={sharedStyles.drawerProductName}>— {formData.nombre}</span>}
                    </div>
                    <button className={sharedStyles.drawerClose} onClick={() => setModalOpen(false)}>×</button>
                </div>
                <form onSubmit={$2} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto' }}>
                        <div className={sharedStyles.formGrid2}>`);
                        
  c = c.replace(/<div className=\{sharedStyles\.formGroup\}>\s*<label>([^<]+)<\/label>\s*<input([^>]*)>/g, '<div className={sharedStyles.formGroup}><label className={sharedStyles.labelRequired}>$1</label><input$2 className={sharedStyles.input} />');
  c = c.replace(/<div className=\{sharedStyles\.formGroup\}>\s*<label>([^<]+)<\/label>\s*<textarea([^>]*)><\/textarea>/g, '</div><div className={sharedStyles.formGroupFull} style={{ marginTop: "1rem" }}><label className={sharedStyles.label}>$1</label><textarea$2 className={sharedStyles.textarea}></textarea></div><div className={sharedStyles.formGrid2}>');
  c = c.replace(/<div className=\{sharedStyles\.formGroupCheckbox\}>[\s\S]*?<\/div>/, '');
  
  c = c.replace(/<div className=\{sharedStyles\.modalActions\}>[\s\S]*?<\/div>\s*<\/form>\s*<\/div>\s*<\/div>\s*\)\}/, `</div><div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: \`1.5px solid \${formData.is_active ? '#2e3b23' : '#e8e8e8'}\`, borderRadius: '8px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Activo</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={\`\${sharedStyles.btn} \${sharedStyles.btnGhost}\`}>Cancelar</button>
                        <button type="submit" className={\`\${sharedStyles.btn} \${sharedStyles.btnPrimary}\`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear'}</button>
                    </div>
                </form>
            </div>`);
            
  fs.writeFileSync(file, c);
}

replaceModal('./frontend/src/pages/Admin/Marcas/AdminMarcas.jsx');
replaceModal('./frontend/src/pages/Admin/Proveedores/AdminProveedores.jsx');
replaceModal('./frontend/src/pages/Admin/Banners/AdminBanners.jsx');
console.log('Marcas, Prov, Banners done');
