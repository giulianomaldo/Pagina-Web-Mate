const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Admin/Promociones/AdminPromociones.jsx', 'utf8');

const targetRegex = /\{showModal && \([\s\S]*?<div className=\{sharedStyles\.modalOverlay\}>[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/;

const replacement = `{showModal && <div className={sharedStyles.drawerBackdrop} onClick={() => setShowModal(false)} />}
      <div className={\`\${sharedStyles.drawer} \${showModal ? sharedStyles.drawerOpen : ''}\`}>
        <div className={sharedStyles.drawerHeader}>
            <div className={sharedStyles.drawerTitle}>
                {editingPromo ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}
                {editingPromo && <span className={sharedStyles.drawerProductName}>— {formData.nombre}</span>}
            </div>
            <button type="button" className={sharedStyles.drawerClose} onClick={() => setShowModal(false)}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              
              <div className={sharedStyles.formGrid2}>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.labelRequired}>Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className={sharedStyles.input} />
                  </div>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.label}>Aplica a</label>
                    <select name="aplica_a" value={formData.aplica_a} onChange={handleChange} className={sharedStyles.select}>
                      <option value="todos">Todos los productos</option>
                      <option value="categoria">Categoría específica</option>
                      <option value="marca">Marca específica</option>
                      <option value="producto">Producto específico</option>
                    </select>
                  </div>
              </div>

              <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                <label className={sharedStyles.label}>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className={sharedStyles.textarea} />
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <span className={sharedStyles.label}>Tipo de descuento:</span>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="tipo_descuento" value="porcentaje" checked={formData.tipo_descuento === 'porcentaje'} onChange={handleChange} />
                    Porcentaje
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="tipo_descuento" value="monto_fijo" checked={formData.tipo_descuento === 'monto_fijo'} onChange={handleChange} />
                    Monto Fijo
                    </label>
                </div>
              </div>

              <div className={sharedStyles.formGrid2} style={{ marginTop: '1.5rem' }}>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.labelRequired}>Valor Descuento</label>
                  <input type="number" name="valor_descuento" value={formData.valor_descuento} onChange={handleChange} required step="0.01" className={sharedStyles.input} />
                </div>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.label}>Compra Mínima</label>
                  <input type="number" name="compra_minima" value={formData.compra_minima} onChange={handleChange} step="0.01" className={sharedStyles.input} />
                </div>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.label}>Tope de Descuento</label>
                  <input type="number" name="tope_descuento" value={formData.tope_descuento} onChange={handleChange} step="0.01" className={sharedStyles.input} />
                </div>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.label}>Usos Máximos</label>
                  <input type="number" name="usos_maximos" value={formData.usos_maximos} onChange={handleChange} className={sharedStyles.input} />
                </div>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.label}>Fecha Inicio</label>
                  <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} className={sharedStyles.input} />
                </div>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.label}>Fecha Fin</label>
                  <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} className={sharedStyles.input} />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: \`1.5px solid \${formData.is_active ? '#2e3b23' : '#e8e8e8'}\`, borderRadius: '8px' }}>
                      <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                      <div>
                          <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Promoción Activa</div>
                      </div>
                  </label>
              </div>

            </div>
            <div className={sharedStyles.drawerFooter}>
              <button type="button" onClick={() => setShowModal(false)} className={\`\${sharedStyles.btn} \${sharedStyles.btnGhost}\`}>Cancelar</button>
              <button type="submit" className={\`\${sharedStyles.btn} \${sharedStyles.btnPrimary}\`}>{editingPromo ? '✅ Guardar Cambios' : '✅ Crear Promoción'}</button>
            </div>
        </form>
      </div>`;
            
if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync('frontend/src/pages/Admin/Promociones/AdminPromociones.jsx', content);
    console.log("Promociones Done!");
} else {
    console.log("Not found in Promociones");
}
