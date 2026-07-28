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
        await adminApi.put(`/api/promociones/${editingPromo.id}`, payload);
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
        await adminApi.delete(`/api/promociones/${id}`);
        fetchData();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      if (isActive) {
        await adminApi.patch(`/api/promociones/${id}/desactivar`);
      } else {
        await adminApi.patch(`/api/promociones/${id}/activar`);
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
        <button id="promociones-new-btn" onClick={() => handleOpenModal()} className={sharedStyles.primaryBtn}>Nueva Promoción</button>
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
                    <button onClick={() => handleOpenModal(promo)} className={sharedStyles.editBtn}>Editar</button>
                    <button onClick={() => handleDelete(promo.id)} className={sharedStyles.deleteBtn}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={sharedStyles.modalOverlay}>
          <div className={sharedStyles.modal}>
            <h2>{editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                Nombre:
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </label>
              <label>
                Descripción:
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} />
              </label>
              
              <div className={styles.radioGroup}>
                <span>Tipo de descuento:</span>
                <label>
                  <input type="radio" name="tipo_descuento" value="porcentaje" checked={formData.tipo_descuento === 'porcentaje'} onChange={handleChange} />
                  Porcentaje
                </label>
                <label>
                  <input type="radio" name="tipo_descuento" value="monto_fijo" checked={formData.tipo_descuento === 'monto_fijo'} onChange={handleChange} />
                  Monto Fijo
                </label>
              </div>

              <div className={styles.rowGroup}>
                <label>
                  Valor Descuento:
                  <input type="number" name="valor_descuento" value={formData.valor_descuento} onChange={handleChange} required step="0.01" />
                </label>
                <label>
                  Compra Mínima:
                  <input type="number" name="compra_minima" value={formData.compra_minima} onChange={handleChange} step="0.01" />
                </label>
              </div>

              <label>
                Usos Máximos (dejar vacío o 0 para ilimitado):
                <input type="number" name="usos_maximos" value={formData.usos_maximos} onChange={handleChange} />
              </label>

              <label>
                Aplica a:
                <select name="aplica_a" value={formData.aplica_a} onChange={handleChange}>
                  <option value="todos">Todos</option>
                  <option value="categoria">Por Categoría</option>
                  <option value="producto">Por Producto</option>
                </select>
              </label>

              {formData.aplica_a === 'categoria' && (
                <label>
                  Categoría:
                  <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </label>
              )}

              {formData.aplica_a === 'producto' && (
                <div className={styles.multiSelect}>
                  <span>Seleccionar Productos:</span>
                  <div className={styles.checkboxList}>
                    {productos.map(p => (
                      <label key={p.id}>
                        <input type="checkbox" checked={formData.productos_ids.includes(p.id)} onChange={() => handleProductCheckbox(p.id)} />
                        {p.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.rowGroup}>
                <label>
                  Fecha Inicio:
                  <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} />
                </label>
                <label>
                  Fecha Fin:
                  <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} />
                </label>
              </div>

              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                Promoción Activa
              </label>

              <div className={sharedStyles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={sharedStyles.cancelBtn}>Cancelar</button>
                <button type="submit" className={sharedStyles.saveBtn}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromociones;
