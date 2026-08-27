import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminProductos.module.css';

const AdminProductos = () => {
  const { admin } = useAuth();
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', msg: '' });
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', categoria: '', estado: 'todos', destacado: '' });
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [newStock, setNewStock] = useState(0);

  // Form state
  const initialForm = {
    nombre: '', descripcion: '', precio: '', precio_costo: '', 
    stock: '', stock_minimo: '', categoria_id: '', marca_id: '', proveedor_id: '',
    tipo: '', peso_gr: '', is_destacado: false, is_nuevo: false, is_mas_vendido: false,
    is_active: true
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [page, filters.estado, filters.categoria, filters.destacado]);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  const fetchReferenceData = async () => {
    try {
      const [catRes, marRes, provRes] = await Promise.all([
        adminApi.get('/categorias'),
        adminApi.get('/marcas'),
        adminApi.get('/proveedores')
      ]);
      setCategorias(catRes.data?.categorias || []);
      setMarcas(marRes.data?.marcas || []);
      setProveedores(provRes.data?.proveedores || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=20`;
      if (filters.estado === 'inactivos' || filters.estado === 'todos') {
        query += '&includeInactive=true';
      }
      
      const res = await adminApi.get(`/productos${query}`);
      let data = res.data?.productos || [];
      
      // Client-side filtering as fallback for params that might not be handled by backend
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter(p => p.nombre?.toLowerCase().includes(searchLower) || p.slug?.toLowerCase().includes(searchLower));
      }
      if (filters.categoria) {
        data = data.filter(p => String(p.categoria_id) === String(filters.categoria));
      }
      if (filters.estado === 'activos') {
        data = data.filter(p => p.is_active !== false);
      } else if (filters.estado === 'inactivos') {
        data = data.filter(p => p.is_active === false);
      }
      if (filters.destacado === 'true') {
        data = data.filter(p => p.is_destacado);
      } else if (filters.destacado === 'false') {
        data = data.filter(p => !p.is_destacado);
      }

      setProductos(data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      showAlert('Error al cargar los productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchProductos();
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openModal = (mode, product = null) => {
    setFormMode(mode);
    setCurrentProduct(product);
    if (mode === 'edit' && product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        precio_costo: product.precio_costo || '',
        stock: product.stock || '',
        stock_minimo: product.stock_minimo || '',
        categoria_id: product.categoria_id || '',
        marca_id: product.marca_id || '',
        proveedor_id: product.proveedor_id || '',
        tipo: product.tipo || '',
        peso_gr: product.peso_gr || '',
        is_destacado: product.is_destacado || false,
        is_nuevo: product.is_nuevo || false,
        is_mas_vendido: product.is_mas_vendido || false,
        is_active: product.is_active !== false
      });
      setImagePreview(product.imagen || null);
    } else {
      setFormData(initialForm);
      setImagePreview(null);
    }
    setImageFile(null);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setCurrentProduct(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('imagen', imageFile);
      }

      if (formMode === 'create') {
        await adminApi.post('/productos', data);
        showAlert('Producto creado exitosamente');
      } else {
        await adminApi.put(`/productos/${currentProduct.id}`, data);
        showAlert('Producto actualizado exitosamente');
      }
      closeFormModal();
      fetchProductos();
    } catch (error) {
      showAlert('Error al guardar el producto', 'error');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const endpoint = currentStatus ? 'desactivar' : 'activar';
      await adminApi.patch(`/productos/${id}/${endpoint}`);
      fetchProductos();
      showAlert(`Producto ${currentStatus ? 'desactivado' : 'activado'}`);
    } catch (error) {
      showAlert('Error al cambiar el estado', 'error');
    }
  };

  const toggleProperty = async (id, prop) => {
    try {
      // prop can be 'destacado', 'nuevo', 'mas-vendido'
      await adminApi.patch(`/productos/${id}/${prop}`);
      fetchProductos();
    } catch (error) {
      showAlert(`Error al actualizar ${prop}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await adminApi.delete(`/productos/${id}`);
      showAlert('Producto eliminado');
      fetchProductos();
    } catch (error) {
      showAlert('Error al eliminar producto', 'error');
    }
  };

  const openStockModal = (product) => {
    setStockProduct(product);
    setNewStock(product.stock || 0);
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.patch(`/productos/${stockProduct.id}/stock`, { stock: Number(newStock) });
      showAlert('Stock actualizado');
      setShowStockModal(false);
      fetchProductos();
    } catch (error) {
      showAlert('Error al actualizar stock', 'error');
    }
  };

  const getStockBadge = (stock, minStock) => {
    if (stock === 0) return sharedStyles.badgeYellow;
    if (stock < minStock) return sharedStyles.badgeRed;
    return sharedStyles.badgeGreen;
  };

  return (
    <div>
      <div className={sharedStyles.pageHeader}>
        <h1 className={sharedStyles.pageTitle}>Productos</h1>
        <button
          id="productos-new-btn"
          className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}
          onClick={() => openModal('create')}
        >
          Nuevo Producto
        </button>
      </div>

      {alert.msg && (
        <div className={alert.type === 'error' ? sharedStyles.alertError : sharedStyles.alertSuccess}>
          {alert.msg}
        </div>
      )}

      <div className={sharedStyles.toolbar}>
        <div className={sharedStyles.searchWrap}>
          <span className={sharedStyles.searchIcon}>🔍</span>
          <input
            id="productos-search"
            type="text"
            name="search"
            placeholder="Buscar por nombre o slug..."
            className={sharedStyles.searchInput}
            value={filters.search}
            onChange={handleFilterChange}
            onKeyDown={handleSearchKeyPress}
          />
        </div>
        <div className={styles.filtersRow}>
          <select
            name="categoria"
            className={sharedStyles.filterSelect}
            value={filters.categoria}
            onChange={handleFilterChange}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

          <select
            name="estado"
            className={sharedStyles.filterSelect}
            value={filters.estado}
            onChange={handleFilterChange}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          <select
            name="destacado"
            className={sharedStyles.filterSelect}
            value={filters.destacado}
            onChange={handleFilterChange}
          >
            <option value="">Cualquier destacado</option>
            <option value="true">Destacados</option>
            <option value="false">No Destacados</option>
          </select>
        </div>
      </div>

      <div className={sharedStyles.tableWrap}>
        <table className={sharedStyles.table}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre / Slug</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Destacado</th>
              <th>Nuevo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className={sharedStyles.spinner}>Cargando...</div>
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan="9">
                  <div className={sharedStyles.emptyState}>
                    <div className={sharedStyles.emptyIcon}>📦</div>
                    <div className={sharedStyles.emptyText}>No se encontraron productos.</div>
                  </div>
                </td>
              </tr>
            ) : (
              productos.map(p => {
                const isActivo = p.is_active !== false;
                return (
                  <tr key={p.id}>
                    <td>
                      {p.imagen ? (
                        <img src={p.imagen} alt={p.nombre} className={sharedStyles.tableImg} />
                      ) : (
                        <div className={sharedStyles.tableImgPlaceholder}>Sin Img</div>
                      )}
                    </td>
                    <td>
                      <strong>{p.nombre}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{p.slug}</small>
                    </td>
                    <td>{categorias.find(c => c.id === p.categoria_id)?.nombre || '-'}</td>
                    <td>${Number(p.precio).toFixed(2)}</td>
                    <td>
                      <span className={`${sharedStyles.badge} ${getStockBadge(p.stock, p.stock_minimo)}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <label className={sharedStyles.toggle}>
                        <input
                          type="checkbox"
                          checked={isActivo}
                          onChange={() => toggleStatus(p.id, isActivo)}
                        />
                        <span className={sharedStyles.toggleSlider}></span>
                      </label>
                    </td>
                    <td>
                      <label className={sharedStyles.toggle}>
                        <input
                          type="checkbox"
                          checked={!!p.is_destacado}
                          onChange={() => toggleProperty(p.id, 'destacado')}
                        />
                        <span className={sharedStyles.toggleSlider}></span>
                      </label>
                    </td>
                    <td>
                      <label className={sharedStyles.toggle}>
                        <input
                          type="checkbox"
                          checked={!!p.is_nuevo}
                          onChange={() => toggleProperty(p.id, 'nuevo')}
                        />
                        <span className={sharedStyles.toggleSlider}></span>
                      </label>
                    </td>
                    <td>
                      <div className={sharedStyles.actions}>
                        <button
                          className={`${sharedStyles.btn} ${sharedStyles.btnGhost} ${sharedStyles.btnSm}`}
                          onClick={() => openModal('edit', p)}
                        >
                          Editar
                        </button>
                        <button
                          className={`${sharedStyles.btn} ${sharedStyles.btnGhost} ${sharedStyles.btnSm}`}
                          onClick={() => openStockModal(p)}
                        >
                          Stock
                        </button>
                        {admin?.rol === 'superadmin' && (
                          <button
                            className={`${sharedStyles.btn} ${sharedStyles.btnDanger} ${sharedStyles.btnSm}`}
                            onClick={() => handleDelete(p.id)}
                          >
                            Eliminar
                          </button>
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

      {totalPages > 1 && (
        <div className={sharedStyles.pagination}>
          <div className={sharedStyles.paginationBtns}>
            <button
              className={sharedStyles.paginationBtn}
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </button>
            <span style={{ margin: '0 1rem' }}>Página {page} de {totalPages}</span>
            <button
              className={sharedStyles.paginationBtn}
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT FORM MODAL */}
      {showFormModal && (
        <div className={sharedStyles.modalBackdrop}>
          <div className={sharedStyles.modal}>
            <div className={sharedStyles.modalHeader}>
              <h2 className={sharedStyles.modalTitle}>
                {formMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
              </h2>
              <button className={sharedStyles.modalClose} onClick={closeFormModal}>&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={sharedStyles.modalBody}>
                <div className={sharedStyles.formGrid2}>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.labelRequired}>Nombre</label>
                    <input
                      required
                      type="text"
                      name="nombre"
                      className={sharedStyles.input}
                      value={formData.nombre}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.label}>Tipo</label>
                    <input
                      type="text"
                      name="tipo"
                      className={sharedStyles.input}
                      value={formData.tipo}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.labelRequired}>Precio</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      name="precio"
                      className={sharedStyles.input}
                      value={formData.precio}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.label}>Precio Costo</label>
                    <input
                      type="number"
                      step="0.01"
                      name="precio_costo"
                      className={sharedStyles.input}
                      value={formData.precio_costo}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.labelRequired}>Stock</label>
                    <input
                      required
                      type="number"
                      name="stock"
                      className={sharedStyles.input}
                      value={formData.stock}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.labelRequired}>Stock Mínimo</label>
                    <input
                      required
                      type="number"
                      name="stock_minimo"
                      className={sharedStyles.input}
                      value={formData.stock_minimo}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.labelRequired}>Categoría</label>
                    <select
                      required
                      name="categoria_id"
                      className={sharedStyles.select}
                      value={formData.categoria_id}
                      onChange={handleFormChange}
                    >
                      <option value="">Seleccione...</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.label}>Marca</label>
                    <select
                      name="marca_id"
                      className={sharedStyles.select}
                      value={formData.marca_id}
                      onChange={handleFormChange}
                    >
                      <option value="">Seleccione...</option>
                      {marcas.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.label}>Proveedor</label>
                    <select
                      name="proveedor_id"
                      className={sharedStyles.select}
                      value={formData.proveedor_id}
                      onChange={handleFormChange}
                    >
                      <option value="">Seleccione...</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className={sharedStyles.formGroup}>
                    <label className={sharedStyles.label}>Peso (gr)</label>
                    <input
                      type="number"
                      name="peso_gr"
                      className={sharedStyles.input}
                      value={formData.peso_gr}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                  <label className={sharedStyles.label}>Descripción</label>
                  <textarea
                    name="descripcion"
                    className={sharedStyles.textarea}
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                  ></textarea>
                </div>

                <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                  <label className={sharedStyles.label}>Imagen</label>
                  <div className={styles.fileInputWrapper}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={sharedStyles.input}
                    />
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                    )}
                  </div>
                </div>

                <div className={sharedStyles.formGrid3} style={{ marginTop: '1.5rem' }}>
                  <label className={sharedStyles.checkboxRow}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleFormChange}
                    />
                    <span>Activo</span>
                  </label>
                  <label className={sharedStyles.checkboxRow}>
                    <input
                      type="checkbox"
                      name="is_destacado"
                      checked={formData.is_destacado}
                      onChange={handleFormChange}
                    />
                    <span>Destacado</span>
                  </label>
                  <label className={sharedStyles.checkboxRow}>
                    <input
                      type="checkbox"
                      name="is_nuevo"
                      checked={formData.is_nuevo}
                      onChange={handleFormChange}
                    />
                    <span>Nuevo</span>
                  </label>
                  <label className={sharedStyles.checkboxRow}>
                    <input
                      type="checkbox"
                      name="is_mas_vendido"
                      checked={formData.is_mas_vendido}
                      onChange={handleFormChange}
                    />
                    <span>Más Vendido</span>
                  </label>
                </div>
              </div>
              <div className={sharedStyles.modalFooter}>
                <button type="button" className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`} onClick={closeFormModal}>
                  Cancelar
                </button>
                <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>
                  {formMode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK MODAL */}
      {showStockModal && (
        <div className={sharedStyles.modalBackdrop}>
          <div className={`${sharedStyles.modal} ${sharedStyles.modalSm}`}>
            <div className={sharedStyles.modalHeader}>
              <h2 className={sharedStyles.modalTitle}>Ajustar Stock</h2>
              <button className={sharedStyles.modalClose} onClick={() => setShowStockModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleStockSubmit}>
              <div className={sharedStyles.modalBody}>
                <p>Producto: <strong>{stockProduct?.nombre}</strong></p>
                <div className={sharedStyles.formGroup}>
                  <label className={sharedStyles.labelRequired}>Nuevo Stock</label>
                  <input
                    required
                    type="number"
                    className={sharedStyles.input}
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                  />
                </div>
              </div>
              <div className={sharedStyles.modalFooter}>
                <button type="button" className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`} onClick={() => setShowStockModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>
                  Actualizar
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
