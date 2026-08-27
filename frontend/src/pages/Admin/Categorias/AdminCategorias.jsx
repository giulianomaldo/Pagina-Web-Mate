import React, { useState, useEffect } from 'react';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminCategorias.module.css';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const AdminCategorias = () => {
    const { admin } = useAuth();
    const [categorias, setCategorias] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null, nombre: '', slug: '', emoji: '', descripcion: '', orden: 0, parent_id: '', is_active: true
    });

    const fetchCategorias = async () => {
        try {
            const res = await adminApi.get('/categorias?includeInactive=true');
            setCategorias(res.data.categorias || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            const nextData = { ...prev, [name]: newValue };
            if (name === 'nombre' && !prev.id) {
                nextData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
            }
            return nextData;
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData };
            if (!data.parent_id) delete data.parent_id;
            
            if (formData.id) {
                await adminApi.put(`/categorias/${formData.id}`, data);
            } else {
                await adminApi.post('/categorias', data);
            }
            setModalOpen(false);
            fetchCategorias();
        } catch (error) {
            let errorMsg = error.data?.message || error.message || 'Error al guardar';
            if (error.data?.errors && Array.isArray(error.data.errors)) {
                errorMsg = error.data.errors.map(e => e.mensaje || e.msg).join(' - ');
            }
            alert(`❌ Error: ${errorMsg}`);
            console.error(error);
        }
    };

    const handleEdit = (cat) => {
        setFormData({ ...cat, parent_id: cat.parent_id || '' });
        setModalOpen(true);
    };

    const handleToggleActive = async (cat) => {
        try {
            if (cat.is_active) {
                await adminApi.patch(`/categorias/${cat.id}/desactivar`);
            } else {
                await adminApi.patch(`/categorias/${cat.id}/activar`);
            }
            fetchCategorias();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
        try {
            await adminApi.delete(`/categorias/${id}`);
            fetchCategorias();
        } catch (error) {
            console.error(error);
        }
    };

    const filtered = categorias.filter(c => c.nombre?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className={sharedStyles.container}>
            <div className={sharedStyles.header}>
                <h1>Categorías</h1>
                <button id="categorias-new-btn" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`} onClick={() => {
                    setFormData({ id: null, nombre: '', slug: '', emoji: '', descripcion: '', orden: 0, parent_id: '', is_active: true });
                    setModalOpen(true);
                }}>Nueva Categoría</button>
            </div>
            
            <input id="categorias-search" type="text" placeholder="Buscar categoría..." value={search} onChange={handleSearchChange} className={sharedStyles.searchInput} />

            <table className={sharedStyles.table}>
                <thead>
                    <tr>
                        <th>Emoji</th>
                        <th>Nombre</th>
                        <th>Slug</th>
                        <th>Descripción</th>
                        <th>Orden</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(cat => (
                        <tr key={cat.id}>
                            <td>{cat.emoji}</td>
                            <td>{cat.nombre}</td>
                            <td>{cat.slug}</td>
                            <td>{cat.descripcion}</td>
                            <td>{cat.orden}</td>
                            <td>
                                <span className={cat.is_active ? sharedStyles.badgeGreen : sharedStyles.badgeRed}>
                                    {cat.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>
                                <button className={sharedStyles.actionBtnEdit} onClick={() => handleEdit(cat)}>✏️ Editar</button>
                                <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(cat)}>
                                    {cat.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                                {admin?.is_superadmin && (
                                    <button className={sharedStyles.actionBtnDelete} onClick={() => handleDelete(cat.id)}>🗑️ Eliminar</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && <div className={sharedStyles.drawerBackdrop} onClick={() => setModalOpen(false)} />}
            <div className={`${sharedStyles.drawer} ${modalOpen ? sharedStyles.drawerOpen : ''}`}>
                <div className={sharedStyles.drawerHeader}>
                    <div className={sharedStyles.drawerTitle}>
                        {formData.id ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
                        {formData.id && <span className={sharedStyles.drawerProductName}>— {formData.nombre}</span>}
                    </div>
                    <button className={sharedStyles.drawerClose} onClick={() => setModalOpen(false)}>×</button>
                </div>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className={sharedStyles.formGrid2}>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.labelRequired}>Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Orden</label>
                                <input type="number" name="orden" value={formData.orden} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                        </div>

                        <div className={sharedStyles.formGrid2} style={{ alignItems: 'end' }}>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Es subcategoría de (Opcional)</label>
                                <select name="parent_id" value={formData.parent_id} onChange={handleFormChange} className={sharedStyles.select}>
                                    <option value="">Ninguna (Es una categoría principal)</option>
                                    {categorias.filter(c => c.id !== formData.id).map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.55rem 1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: `1.5px solid ${formData.is_active ? '#2e3b23' : '#e2e6dc'}`, borderRadius: '8px', height: '100%' }}>
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                    <span style={{ fontWeight: 600, fontSize: '.9rem', color: formData.is_active ? '#1a2210' : '#7a8a70' }}>
                                        {formData.is_active ? '🟢 Categoría Activa' : '⚪ Categoría Inactiva'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className={sharedStyles.formGroupFull}>
                            <label className={sharedStyles.label}>Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleFormChange} className={sharedStyles.textarea} style={{ minHeight: '100px' }}></textarea>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`}>Cancelar</button>
                        <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear Categoría'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCategorias;
