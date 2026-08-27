import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminPromociones.module.css';

const AdminPromociones = () => {
  const { admin } = useAuth();
  const [promociones, setPromociones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_descuento: 'porcentaje',
    valor_descuento: '',
    compra_minima: '',
    usos_maximos: '',
    aplica_a: 'todos',
    categoria_id: '',
    productos_ids: [],
    fecha_inicio: '',
    fecha_fin: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [promosRes, catRes, prodRes] = await Promise.all([
        adminApi.get('/promociones'),
        adminApi.get('/categorias'),
        adminApi.get('/productos')
      ]);
      setPromociones(promosRes.data?.promociones || promosRes.data || []);
      setCategorias(catRes.data?.categorias || catRes.data || []);
      setProductos(prodRes.data?.productos || prodRes.data || []);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        ...promo,
        fecha_inicio: promo.fecha_inicio ? promo.fecha_inicio.split('T')[0] : '',
        fecha_fin: promo.fecha_fin ? promo.fecha_fin.split('T')[0] : '',
        productos_ids: promo.productos_ids || []
      });
    } else {
      setEditingPromo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        tipo_descuento: 'porcentaje',
        valor_descuento: '',
        compra_minima: '',
        usos_maximos: '',
        aplica_a: 'todos',
        categoria_id: '',
        productos_ids: [],
        fecha_inicio: '',
        fecha_fin: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProductCheckbox = (productId) => {
    const currentIds = formData.productos_ids;
    if (currentIds.includes(productId)) {
      setFormData({ ...formData, productos_ids: currentIds.filter(id => id !== productId) });
    } else {
      setFormData({ ...formData, productos_ids: [...currentIds, productId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        valor_descuento: Number(formData.valor_descuento),
        compra_minima: formData.compra_minima ? Number(formData.compra_minima) : null,
        usos_maximos: formData.usos_maximos ? Number(formData.usos_maximos) : null,
        categoria_id: formData.aplica_a === 'categoria' ? formData.categoria_id : null,
        productos_ids: formData.aplica_a === 'producto' ? formData.productos_ids : []
      };

      if (editingPromo) {
        await adminApi.put(`/promociones/${editingPromo.id}`, payload);
      } else {
        await adminApi.post('/promociones', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error al guardar promoción');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar promoción?')) {
      try {
        await adminApi.delete(`/promociones/${id}`);
        fetchData();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      if (isActive) {
        await adminApi.patch(`/promociones/${id}/desactivar`);
      } else {
        await adminApi.patch(`/promociones/${id}/activar`);
      }
      fetchData();
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  return (
    <div className={sharedStyles.container}>
      <header className={sharedStyles.header}>
        <h1>Promociones</h1>
        <button id="promociones-new-btn" onClick={() => handleOpenModal()} className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>Nueva Promoción</button>
      </header>

      {error && <div className={sharedStyles.error}>{error}</div>}
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className={sharedStyles.tableContainer}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo descuento</th>
                <th>Valor</th>
                <th>Aplica a</th>
                <th>Vigencia</th>
                <th>Usos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promociones.map(promo => (
                <tr key={promo.id}>
                  <td>{promo.nombre}</td>
                  <td>
                    <span className={styles.badge}>{promo.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto fijo'}</span>
                  </td>
                  <td>{promo.tipo_descuento === 'porcentaje' ? `${promo.valor_descuento}%` : `$${promo.valor_descuento}`}</td>
                  <td>{promo.aplica_a}</td>
                  <td>{`${promo.fecha_inicio ? promo.fecha_inicio.split('T')[0] : '-'} a ${promo.fecha_fin ? promo.fecha_fin.split('T')[0] : '-'}`}</td>
                  <td>{`${promo.usos_actuales || 0} / ${promo.usos_maximos || '∞'}`}</td>
                  <td>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={promo.is_active} 
                        onChange={() => handleToggleActive(promo.id, promo.is_active)} 
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td className={sharedStyles.actions}>
                    <button onClick={() => handleOpenModal(promo)} className={sharedStyles.actionBtnEdit}>✏️ Editar</button>
                    <button onClick={() => handleDelete(promo.id)} className={sharedStyles.actionBtnDelete}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <div className={sharedStyles.drawerBackdrop} onClick={() => setShowModal(false)} />}
      <div className={`${sharedStyles.drawer} ${showModal ? sharedStyles.drawerOpen : ''}`}>
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: `1.5px solid ${formData.is_active ? '#2e3b23' : '#e8e8e8'}`, borderRadius: '8px' }}>
                      <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                      <div>
                          <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Promoción Activa</div>
                      </div>
                  </label>
              </div>

            </div>
            <div className={sharedStyles.drawerFooter}>
              <button type="button" onClick={() => setShowModal(false)} className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`}>Cancelar</button>
              <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>{editingPromo ? '✅ Guardar Cambios' : '✅ Crear Promoción'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPromociones;
