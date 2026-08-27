const fs = require('fs');

let contentM = fs.readFileSync('frontend/src/pages/Admin/Marcas/AdminMarcas.jsx', 'utf8');
const targetM = /\{modalOpen && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/;

const replacementM = `{modalOpen && <div className={sharedStyles.drawerBackdrop} onClick={() => setModalOpen(false)} />}
            <div className={\`\${sharedStyles.drawer} \${modalOpen ? sharedStyles.drawerOpen : ''}\`}>
                <div className={sharedStyles.drawerHeader}>
                    <div className={sharedStyles.drawerTitle}>
                        {formData.id ? '✏️ Editar Marca' : '➕ Nueva Marca'}
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
                                <label className={sharedStyles.label}>Slug</label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Imagen URL</label>
                                <input type="text" name="imagen_url" value={formData.imagen_url} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                        </div>
                        <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                            <label className={sharedStyles.label}>Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleFormChange} className={sharedStyles.textarea}></textarea>
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: \`1.5px solid \${formData.is_active ? '#2e3b23' : '#e8e8e8'}\`, borderRadius: '8px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Marca Activa</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={\`\${sharedStyles.btn} \${sharedStyles.btnGhost}\`}>Cancelar</button>
                        <button type="submit" className={\`\${sharedStyles.btn} \${sharedStyles.btnPrimary}\`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear Marca'}</button>
                    </div>
                </form>
            </div>`;
            
if(targetM.test(contentM)) {
    contentM = contentM.replace(targetM, replacementM);
    fs.writeFileSync('frontend/src/pages/Admin/Marcas/AdminMarcas.jsx', contentM);
    console.log("Marcas Done");
}


let contentB = fs.readFileSync('frontend/src/pages/Admin/Banners/AdminBanners.jsx', 'utf8');
const targetB = /\{modalOpen && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/;

const replacementB = `{modalOpen && <div className={sharedStyles.drawerBackdrop} onClick={() => setModalOpen(false)} />}
            <div className={\`\${sharedStyles.drawer} \${modalOpen ? sharedStyles.drawerOpen : ''}\`}>
                <div className={sharedStyles.drawerHeader}>
                    <div className={sharedStyles.drawerTitle}>
                        {formData.id ? '✏️ Editar Banner' : '➕ Nuevo Banner'}
                    </div>
                    <button type="button" className={sharedStyles.drawerClose} onClick={() => setModalOpen(false)}>×</button>
                </div>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto' }}>
                        <div className={sharedStyles.formGrid2}>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Título</label>
                                <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Subtítulo</label>
                                <input type="text" name="subtitulo" value={formData.subtitulo} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Link URL</label>
                                <input type="text" name="link_url" value={formData.link_url} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Link Label</label>
                                <input type="text" name="link_label" value={formData.link_label} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Fecha Inicio</label>
                                <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Fecha Fin</label>
                                <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Posición</label>
                                <select name="posicion" value={formData.posicion} onChange={handleFormChange} className={sharedStyles.select}>
                                    <option value="hero">Hero</option>
                                    <option value="mid">Mid</option>
                                    <option value="lateral">Lateral</option>
                                    <option value="popup">Popup</option>
                                </select>
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Orden</label>
                                <input type="number" name="orden" value={formData.orden} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                        </div>
                        <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                            <label className={sharedStyles.label}>Imagen</label>
                            <input type="file" name="imagen" onChange={handleImageChange} accept="image/*" />
                            {formData.imagen_url && !imageFile && <p style={{marginTop:'0.5rem', fontSize:'0.8rem'}}>Imagen actual: <img src={formData.imagen_url} alt="preview" style={{width:'80px', display:'block', marginTop:'0.25rem', borderRadius:'4px'}} /></p>}
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: \`1.5px solid \${formData.is_active ? '#2e3b23' : '#e8e8e8'}\`, borderRadius: '8px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Banner Activo</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={\`\${sharedStyles.btn} \${sharedStyles.btnGhost}\`}>Cancelar</button>
                        <button type="submit" className={\`\${sharedStyles.btn} \${sharedStyles.btnPrimary}\`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear Banner'}</button>
                    </div>
                </form>
            </div>`;
            
if(targetB.test(contentB)) {
    contentB = contentB.replace(targetB, replacementB);
    fs.writeFileSync('frontend/src/pages/Admin/Banners/AdminBanners.jsx', contentB);
    console.log("Banners Done");
}
