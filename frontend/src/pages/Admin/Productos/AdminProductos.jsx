import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminProductos.module.css';

// ── Constantes ────────────────────────────────────────────────────────
const TIPOS = ['yerba', 'blend', 'mate', 'bombilla', 'termo', 'accesorio', 'otro'];

const TABS = [
  { id: 'info',        label: 'Información',  icon: '📝' },
  { id: 'precios',     label: 'Precios',       icon: '💰' },
  { id: 'imagen',      label: 'Imagen',        icon: '🖼️' },
  { id: 'visibilidad', label: 'Visibilidad',   icon: '👁️' },
];

const initialForm = {
  nombre: '', descripcion: '', precio: '', precio_costo: '',
  stock: '', stock_minimo: '', categoria_id: '', marca_id: '',
  proveedor_id: '', tipo: '', peso_gr: '',
  is_destacado: false, is_nuevo: false, is_mas_vendido: false, is_active: true,
};

// ── Componente Preview ────────────────────────────────────────────────
function ProductPreview({ form, categorias, marcas, imagePreview }) {
  const cat   = categorias.find(c => String(c.id) === String(form.categoria_id));
  const marca = marcas.find(m => String(m.id) === String(form.marca_id));

  return (
    <div>
      <p className={styles.previewLabel}>Vista previa</p>
      <div className={styles.previewCard}>
        {imagePreview
          ? <img src={imagePreview} alt="preview" className={styles.previewImg} />
          : <div className={styles.previewImgPlaceholder}>{cat?.emoji || '📦'}</div>
        }
        <div className={styles.previewBody}>
          <div className={styles.previewNombre}>{form.nombre || 'Nombre del producto'}</div>
          {marca && <div className={styles.previewMarca}>por {marca.nombre}</div>}
          <div className={styles.previewPrecio}>
            {form.precio ? `$${Number(form.precio).toLocaleString('es-AR')}` : '$0'}
          </div>
          <div className={styles.previewBadges}>
            {form.is_nuevo      && <span className={`${styles.previewBadge} ${styles.badgeNuevo}`}>Nuevo</span>}
            {form.is_destacado  && <span className={`${styles.previewBadge} ${styles.badgeDestacado}`}>⭐ Destacado</span>}
            {form.is_mas_vendido && <span className={`${styles.previewBadge} ${styles.badgeVendido}`}>🔥 Top ventas</span>}
            {!form.is_active    && <span className={`${styles.previewBadge} ${styles.badgeInactivo}`}>Inactivo</span>}
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ fontSize: '.78rem', color: '#555' }}>
        {cat && <p>📂 {cat.emoji} {cat.nombre}</p>}
        {form.stock !== '' && (
          <p style={{ color: Number(form.stock) === 0 ? '#dc2626' : Number(form.stock) < Number(form.stock_minimo || 5) ? '#d97706' : '#16a34a' }}>
            📦 Stock: {form.stock} {form.stock_minimo ? `(mín. ${form.stock_minimo})` : ''}
          </p>
        )}
        {form.tipo    && <p>🏷️ {form.tipo}</p>}
        {form.peso_gr && <p>⚖️ {form.peso_gr} gr</p>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
const AdminProductos = () => {
  const { admin } = useAuth();

  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [marcas,      setMarcas]      = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState({ type: '', msg: '' });

  // Paginación y filtros
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters,    setFilters]    = useState({ search: '', categoria: '', estado: 'todos', destacado: '' });

  // Drawer de edición
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [drawerMode,   setDrawerMode]   = useState('create'); // 'create' | 'edit'
  const [activeTab,    setActiveTab]    = useState('info');
  const [currentProduct, setCurrentProduct] = useState(null);

  // Modal de stock
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct,   setStockProduct]   = useState(null);
  const [newStock,       setNewStock]       = useState(0);

  // Formulario
  const [formData,     setFormData]     = useState(initialForm);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving,       setSaving]       = useState(false);

  // ── Efectos ─────────────────────────────────────────────────────────
  useEffect(() => { fetchReferenceData(); }, []);
  useEffect(() => { fetchProductos(); }, [page, filters.estado, filters.categoria, filters.destacado]);

  // ── Helpers ──────────────────────────────────────────────────────────
  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  // ── API calls ────────────────────────────────────────────────────────
  const fetchReferenceData = async () => {
    try {
      const [catRes, marRes, provRes] = await Promise.all([
        adminApi.get('/categorias'),
        adminApi.get('/marcas'),
        adminApi.get('/proveedores'),
      ]);
      setCategorias(catRes.data?.categorias   || []);
      setMarcas(marRes.data?.marcas           || []);
      setProveedores(provRes.data?.proveedores || []);
    } catch (err) {
      console.error('Error cargando datos de referencia:', err);
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=20`;
      if (filters.estado !== 'activos') query += '&includeInactive=true';
      const res  = await adminApi.get(`/productos${query}`);
      let data   = res.data?.productos || [];

      // Filtros cliente
      if (filters.search)    data = data.filter(p => p.nombre?.toLowerCase().includes(filters.search.toLowerCase()) || p.slug?.includes(filters.search.toLowerCase()));
      if (filters.categoria) data = data.filter(p => String(p.categoria_id) === filters.categoria || p.categoria?.slug === filters.categoria);
      if (filters.estado === 'activos')   data = data.filter(p => p.is_active !== false);
      if (filters.estado === 'inactivos') data = data.filter(p => p.is_active === false);
      if (filters.destacado === 'si')     data = data.filter(p => p.is_destacado);
      if (filters.destacado === 'no')     data = data.filter(p => !p.is_destacado);

      setProductos(data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      showAlert('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Drawer ───────────────────────────────────────────────────────────
  const openDrawer = (mode, product = null) => {
    setDrawerMode(mode);
    setCurrentProduct(product);
    setActiveTab('info');
    if (mode === 'edit' && product) {
      setFormData({
        nombre:       product.nombre        || '',
        descripcion:  product.descripcion   || '',
        precio:       product.precio        || '',
        precio_costo: product.precio_costo  || '',
        stock:        product.stock         ?? '',
        stock_minimo: product.stock_minimo  ?? '',
        categoria_id: product.categoria_id  || product.categoria?.id || '',
        marca_id:     product.marca_id      || product.marca?.id     || '',
        proveedor_id: product.proveedor_id  || '',
        tipo:         product.tipo          || '',
        peso_gr:      product.peso_gr       || '',
        is_destacado:  !!product.is_destacado,
        is_nuevo:      !!product.is_nuevo,
        is_mas_vendido:!!product.is_mas_vendido,
        is_active:     product.is_active !== false,
      });
      setImagePreview(product.imagen_url || product.imagen || null);
    } else {
      setFormData(initialForm);
      setImagePreview(null);
    }
    setImageFile(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => { setCurrentProduct(null); }, 300);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) data.append('imagen', imageFile);

      if (drawerMode === 'create') {
        await adminApi.post('/productos', data);
        showAlert('✅ Producto creado exitosamente');
      } else {
        await adminApi.put(`/productos/${currentProduct.id}`, data);
        showAlert('✅ Producto actualizado exitosamente');
      }
      closeDrawer();
      fetchProductos();
    } catch (err) {
      showAlert(`❌ Error: ${err.message || 'No se pudo guardar el producto'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle rápido en tabla ────────────────────────────────────────────
  const toggleStatus = async (id, isActivo) => {
    try {
      await adminApi.patch(`/productos/${id}/${isActivo ? 'desactivar' : 'activar'}`);
      fetchProductos();
    } catch {
      showAlert('Error al cambiar estado', 'error');
    }
  };

  const toggleProperty = async (id, prop) => {
    try {
      await adminApi.patch(`/productos/${id}/${prop}`);
      fetchProductos();
    } catch {
      showAlert(`Error al actualizar`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await adminApi.delete(`/productos/${id}`);
      showAlert('Producto eliminado');
      fetchProductos();
    } catch {
      showAlert('Error al eliminar producto', 'error');
    }
  };

  // ── Stock modal ───────────────────────────────────────────────────────
  const openStockModal = (product) => {
    setStockProduct(product);
    setNewStock(product.stock ?? 0);
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.patch(`/productos/${stockProduct.id}/stock`, { stock: Number(newStock) });
      showAlert('📦 Stock actualizado');
      setShowStockModal(false);
      fetchProductos();
    } catch {
      showAlert('Error al actualizar stock', 'error');
    }
  };

  // ── Badge de stock ───────────────────────────────────────────────────
  const getStockBadge = (stock, min) => {
    if (stock === 0)       return sharedStyles.badgeRed;
    if (stock < (min || 5)) return sharedStyles.badgeYellow;
    return sharedStyles.badgeGreen;
  };

  // ════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Header ── */}
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.pageTitle}>Productos</h1>
        <button
          id="productos-new-btn"
          className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}
          onClick={() => openDrawer('create')}
        >
          + Nuevo Producto
        </button>
      </div>

      {/* ── Alertas ── */}
      {alert.msg && (
        <div className={alert.type === 'error' ? sharedStyles.alertError : sharedStyles.alertSuccess}>
          {alert.msg}
        </div>
      )}

      {/* ── Toolbar filtros ── */}
      <div className={sharedStyles.toolbar}>
        <div className={sharedStyles.searchWrap}>
          <span className={sharedStyles.searchIcon}>🔍</span>
          <input
            id="productos-search"
            type="text"
            placeholder="Buscar por nombre..."
            className={sharedStyles.searchInput}
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && fetchProductos()}
          />
        </div>
        <select
          className={sharedStyles.filterSelect}
          value={filters.categoria}
          onChange={e => { setFilters(f => ({ ...f, categoria: e.target.value })); setPage(1); }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.emoji} {c.nombre}</option>)}
        </select>
        <select
          className={sharedStyles.filterSelect}
          value={filters.estado}
          onChange={e => { setFilters(f => ({ ...f, estado: e.target.value })); setPage(1); }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>
        <select
          className={sharedStyles.filterSelect}
          value={filters.destacado}
          onChange={e => { setFilters(f => ({ ...f, destacado: e.target.value })); setPage(1); }}
        >
          <option value="">Destacado: todos</option>
          <option value="si">Solo destacados</option>
          <option value="no">No destacados</option>
        </select>
      </div>

      {/* ── Tabla ── */}
      <div className={sharedStyles.tableWrap}>
        <table className={sharedStyles.table}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Activo</th>
              <th>⭐</th>
              <th>🆕</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                <div className={sharedStyles.spinner}>Cargando...</div>
              </td></tr>
            ) : productos.length === 0 ? (
              <tr><td colSpan="9">
                <div className={sharedStyles.emptyState}>
                  <div className={sharedStyles.emptyIcon}>📦</div>
                  <div className={sharedStyles.emptyText}>No se encontraron productos.</div>
                </div>
              </td></tr>
            ) : (
              productos.map(p => {
                const isActivo = p.is_active !== false;
                const catNombre = p.categoria?.nombre
                  || categorias.find(c => String(c.id) === String(p.categoria_id))?.nombre
                  || '—';
                return (
                  <tr key={p.id} style={{ opacity: isActivo ? 1 : .55 }}>
                    <td>
                      {(p.imagen_url || p.imagen)
                        ? <img src={p.imagen_url || p.imagen} alt={p.nombre} className={sharedStyles.tableImg} />
                        : <div className={sharedStyles.tableImgPlaceholder}>📦</div>
                      }
                    </td>
                    <td>
                      <strong>{p.nombre}</strong>
                      <br />
                      <small style={{ color: '#888' }}>{p.slug}</small>
                    </td>
                    <td>{catNombre}</td>
                    <td><strong>${Number(p.precio).toLocaleString('es-AR')}</strong></td>
                    <td>
                      <span className={`${sharedStyles.badge} ${getStockBadge(p.stock, p.stock_minimo)}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <label className={sharedStyles.toggle}>
                        <input type="checkbox" checked={isActivo} onChange={() => toggleStatus(p.id, isActivo)} />
                        <span className={sharedStyles.toggleSlider} />
                      </label>
                    </td>
                    <td>
                      <label className={sharedStyles.toggle}>
                        <input type="checkbox" checked={!!p.is_destacado} onChange={() => toggleProperty(p.id, 'destacado')} />
                        <span className={sharedStyles.toggleSlider} />
                      </label>
                    </td>
                    <td>
                      <label className={sharedStyles.toggle}>
                        <input type="checkbox" checked={!!p.is_nuevo} onChange={() => toggleProperty(p.id, 'nuevo')} />
                        <span className={sharedStyles.toggleSlider} />
                      </label>
                    </td>
                    <td>
                      <div className={sharedStyles.actions}>
                        <button className={sharedStyles.actionBtnEdit}   onClick={() => openDrawer('edit', p)}>✏️ Editar</button>
                        <button className={styles.actionBtnStock}  onClick={() => openStockModal(p)}>📦 Stock</button>
                        {admin?.rol === 'superadmin' && (
                          <button className={sharedStyles.actionBtnDelete} onClick={() => handleDelete(p.id)}>🗑️ Eliminar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className={sharedStyles.pagination}>
          <div className={sharedStyles.paginationBtns}>
            <button className={sharedStyles.paginationBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
            <span style={{ margin: '0 1rem', fontSize: '.9rem', color: '#555' }}>Página {page} de {totalPages}</span>
            <button className={sharedStyles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
           DRAWER LATERAL DE EDICIÓN
      ════════════════════════════════════════════════════ */}
      {drawerOpen && <div className={styles.drawerBackdrop} onClick={closeDrawer} />}

      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            {drawerMode === 'create' ? '➕ Nuevo Producto' : '✏️ Editar Producto'}
            {drawerMode === 'edit' && currentProduct && (
              <span className={styles.drawerProductName}>— {currentProduct.nombre}</span>
            )}
          </div>
          <button className={styles.drawerClose} onClick={closeDrawer}>×</button>
        </div>

        {/* Pestañas */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Cuerpo: form + preview */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className={styles.drawerBody}>

            {/* ── Formulario (panel izquierdo) ── */}
            <div className={styles.drawerForm}>

              {/* TAB: Información */}
              {activeTab === 'info' && (
                <div>
                  <div className={sharedStyles.formGrid2}>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.labelRequired}>Nombre</label>
                      <input required type="text" name="nombre" className={sharedStyles.input}
                        value={formData.nombre} onChange={handleFormChange} placeholder="Ej: Taragüi 1kg" />
                    </div>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.label}>Tipo</label>
                      <select name="tipo" className={sharedStyles.select} value={formData.tipo} onChange={handleFormChange}>
                        <option value="">Seleccionar tipo...</option>
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                    <label className={sharedStyles.label}>Descripción</label>
                    <textarea name="descripcion" className={sharedStyles.textarea} rows="4"
                      value={formData.descripcion} onChange={handleFormChange}
                      placeholder="Describe el producto, sus características principales..." />
                  </div>

                  <div className={sharedStyles.formGrid2} style={{ marginTop: '1rem' }}>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.labelRequired}>Categoría</label>
                      <select required name="categoria_id" className={sharedStyles.select}
                        value={formData.categoria_id} onChange={handleFormChange}>
                        <option value="">Seleccione categoría...</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
                      </select>
                    </div>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.label}>Marca</label>
                      <select name="marca_id" className={sharedStyles.select}
                        value={formData.marca_id} onChange={handleFormChange}>
                        <option value="">Sin marca</option>
                        {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>
                    </div>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.label}>Proveedor</label>
                      <select name="proveedor_id" className={sharedStyles.select}
                        value={formData.proveedor_id} onChange={handleFormChange}>
                        <option value="">Sin proveedor</option>
                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    </div>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.label}>Peso (gr)</label>
                      <input type="number" name="peso_gr" className={sharedStyles.input}
                        value={formData.peso_gr} onChange={handleFormChange} placeholder="Ej: 500" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Precios */}
              {activeTab === 'precios' && (
                <div>
                  <div className={sharedStyles.formGrid2}>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.labelRequired}>Precio de venta ($)</label>
                      <input required type="number" step="0.01" name="precio" className={sharedStyles.input}
                        value={formData.precio} onChange={handleFormChange} placeholder="0.00" />
                      <small style={{ color: '#888', marginTop: '.25rem', display: 'block' }}>Precio que ve el cliente</small>
                    </div>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.label}>Precio de costo ($)</label>
                      <input type="number" step="0.01" name="precio_costo" className={sharedStyles.input}
                        value={formData.precio_costo} onChange={handleFormChange} placeholder="0.00" />
                      <small style={{ color: '#888', marginTop: '.25rem', display: 'block' }}>Solo para uso interno</small>
                    </div>
                  </div>

                  {formData.precio && formData.precio_costo && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <p style={{ fontSize: '.85rem', color: '#166534', fontWeight: 600, margin: 0 }}>
                        💹 Margen estimado:{' '}
                        {(((Number(formData.precio) - Number(formData.precio_costo)) / Number(formData.precio_costo)) * 100).toFixed(1)}%
                        {' '}(${(Number(formData.precio) - Number(formData.precio_costo)).toLocaleString('es-AR')} de ganancia)
                      </p>
                    </div>
                  )}

                  <div className={sharedStyles.formGrid2} style={{ marginTop: '1.5rem' }}>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.labelRequired}>Stock actual</label>
                      <input required type="number" name="stock" className={sharedStyles.input}
                        value={formData.stock} onChange={handleFormChange} placeholder="0" />
                    </div>
                    <div className={sharedStyles.formGroup}>
                      <label className={sharedStyles.label}>Stock mínimo (alerta)</label>
                      <input type="number" name="stock_minimo" className={sharedStyles.input}
                        value={formData.stock_minimo} onChange={handleFormChange} placeholder="5" />
                      <small style={{ color: '#888', marginTop: '.25rem', display: 'block' }}>Se muestra alerta cuando el stock baja de este número</small>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Imagen */}
              {activeTab === 'imagen' && (
                <div>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.label}>Imagen del producto</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className={sharedStyles.input} />
                    <small style={{ color: '#888', display: 'block', marginTop: '.25rem' }}>
                      Formatos: JPG, PNG, WEBP. Tamaño recomendado: 800×800px.
                    </small>
                  </div>
                  {imagePreview && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <p style={{ fontSize: '.8rem', color: '#888', marginBottom: '.5rem' }}>Vista previa:</p>
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '280px', maxHeight: '280px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #ddd' }} />
                      <div style={{ marginTop: '.5rem' }}>
                        <button type="button" style={{ fontSize: '.78rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                          onClick={() => { setImageFile(null); setImagePreview(null); }}>
                          🗑️ Quitar imagen
                        </button>
                      </div>
                    </div>
                  )}
                  {!imagePreview && (
                    <div style={{ marginTop: '2rem', padding: '3rem', border: '2px dashed #ddd', borderRadius: '10px', textAlign: 'center', color: '#aaa' }}>
                      <div style={{ fontSize: '3rem' }}>🖼️</div>
                      <p style={{ margin: '.5rem 0 0', fontSize: '.85rem' }}>Sin imagen — seleccioná un archivo arriba</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Visibilidad */}
              {activeTab === 'visibilidad' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { name: 'is_active',      label: 'Producto activo',    desc: 'Si está desactivado no aparece en la tienda',              icon: '🟢' },
                    { name: 'is_destacado',   label: 'Destacado',          desc: 'Aparece en la sección de productos destacados del home',   icon: '⭐' },
                    { name: 'is_nuevo',       label: 'Nuevo',              desc: 'Muestra la etiqueta "Nuevo" en la tarjeta del producto',   icon: '🆕' },
                    { name: 'is_mas_vendido', label: 'Más vendido',        desc: 'Muestra la etiqueta "🔥 Top ventas"',                      icon: '🔥' },
                  ].map(opt => (
                    <label key={opt.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', padding: '1rem', borderRadius: '8px', border: `1.5px solid ${formData[opt.name] ? '#2e3b23' : '#e8e8e8'}`, background: formData[opt.name] ? '#f0fdf4' : '#fff', transition: 'all .15s' }}>
                      <input type="checkbox" name={opt.name} checked={formData[opt.name]} onChange={handleFormChange} style={{ marginTop: '.2rem', width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{opt.icon} {opt.label}</div>
                        <div style={{ fontSize: '.78rem', color: '#666', marginTop: '.15rem' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* ── Preview (panel derecho) ── */}
            <div className={styles.drawerPreview}>
              <ProductPreview
                form={formData}
                categorias={categorias}
                marcas={marcas}
                imagePreview={imagePreview}
              />
            </div>
          </div>

          {/* Footer con botones */}
          <div className={styles.drawerFooter}>
            <button type="button" className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`} onClick={closeDrawer}>
              Cancelar
            </button>
            {/* Navegación entre tabs */}
            {activeTab !== 'info' && (
              <button type="button" className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`}
                onClick={() => { const idx = TABS.findIndex(t => t.id === activeTab); setActiveTab(TABS[idx - 1].id); }}>
                ← Anterior
              </button>
            )}
            {activeTab !== 'visibilidad' ? (
              <button type="button" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}
                onClick={() => { const idx = TABS.findIndex(t => t.id === activeTab); setActiveTab(TABS[idx + 1].id); }}>
                Siguiente →
              </button>
            ) : (
              <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`} disabled={saving}>
                {saving ? 'Guardando...' : drawerMode === 'create' ? '✅ Crear Producto' : '✅ Guardar Cambios'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ════════════════════════════════════════════════════
           MODAL DE STOCK
      ════════════════════════════════════════════════════ */}
      {showStockModal && (
        <div className={sharedStyles.modalBackdrop}>
          <div className={`${sharedStyles.modal} ${sharedStyles.modalSm}`}>
            <div className={sharedStyles.modalHeader}>
              <h2 className={sharedStyles.modalTitle}>📦 Ajustar Stock</h2>
              <button className={sharedStyles.modalClose} onClick={() => setShowStockModal(false)}>×</button>
            </div>
            <form onSubmit={handleStockSubmit}>
              <div className={sharedStyles.modalBody}>
                <p style={{ marginBottom: '1rem' }}>
                  Producto: <strong>{stockProduct?.nombre}</strong>
                </p>
                <p style={{ color: '#666', fontSize: '.85rem', marginBottom: '1.2rem' }}>
                  Stock actual: <strong>{stockProduct?.stock}</strong> unidades
                </p>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.labelRequired}>Nuevo stock</label>
                  <input required type="number" min="0" className={sharedStyles.input}
                    value={newStock} onChange={e => setNewStock(e.target.value)} />
                </div>
              </div>
              <div className={sharedStyles.modalFooter}>
                <button type="button" className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`} onClick={() => setShowStockModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>
                  Actualizar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductos;
