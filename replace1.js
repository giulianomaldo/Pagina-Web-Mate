const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Admin/Proveedores/AdminProveedores.jsx', 'utf8');

const targetRegex = /\{modalOpen && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/;

const replacement = `{modalOpen && <div className={sharedStyles.drawerBackdrop} onClick={() => setModalOpen(false)} />}
            <div className={\`\${sharedStyles.drawer} \${modalOpen ? sharedStyles.drawerOpen : ''}\`}>
                <div className={sharedStyles.drawerHeader}>
                    <div className={sharedStyles.drawerTitle}>
                        {formData.id ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}
                        {formData.id && <span className={sharedStyles.drawerProductName}>— {formData.nombre}</span>}
                    </div>
                    <button type="button" className={sharedStyles.drawerClose} onClick={() => setModalOpen(false)}>×</button>
                </div>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto' }}>
                        <div className={sharedStyles.formGrid2}>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.labelRequired}>Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Contacto</label>
                                <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Teléfono</label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Dirección</label>
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                        </div>
                        <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                            <label className={sharedStyles.label}>Notas</label>
                            <textarea name="notas" value={formData.notas} onChange={handleFormChange} className={sharedStyles.textarea}></textarea>
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: \`1.5px solid \${formData.is_active ? '#2e3b23' : '#e8e8e8'}\`, borderRadius: '8px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Proveedor Activo</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={\`\${sharedStyles.btn} \${sharedStyles.btnGhost}\`}>Cancelar</button>
                        <button type="submit" className={\`\${sharedStyles.btn} \${sharedStyles.btnPrimary}\`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear Proveedor'}</button>
                    </div>
                </form>
            </div>`;
            
if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync('frontend/src/pages/Admin/Proveedores/AdminProveedores.jsx', content);
    console.log("Proveedores Done!");
} else {
    console.log("Not found in Proveedores");
}
