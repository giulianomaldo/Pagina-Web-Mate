import React, { useState, useEffect } from 'react';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminMarcas.module.css';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const AdminMarcas = () => {
    const { admin } = useAuth();
    const [marcas, setMarcas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null, nombre: '', slug: '', descripcion: '', imagen_url: '', is_active: true
    });

    const fetchMarcas = async () => {
        try {
            const res = await adminApi.get('/marcas?includeInactive=true');
            setMarcas(res.data?.marcas || res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMarcas();
    }, []);

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
            if (formData.id) {
                await adminApi.put(`/marcas/${formData.id}`, formData);
            } else {
                await adminApi.post('/marcas', formData);
            }
            setModalOpen(false);
            fetchMarcas();
        } catch (error) {
            let errorMsg = error.data?.message || error.message || 'Error al guardar';
            if (error.data?.errors && Array.isArray(error.data.errors)) {
                errorMsg = error.data.errors.map(e => e.mensaje || e.msg).join(' - ');
            }
            alert(`❌ Error: ${errorMsg}`);
            console.error(error);
        }
    };

    const handleEdit = (marca) => {
        setFormData(marca);
        setModalOpen(true);
    };

    const handleToggleActive = async (marca) => {
        try {
            if (marca.is_active) {
                await adminApi.patch(`/marcas/${marca.id}/desactivar`);
            } else {
                await adminApi.patch(`/marcas/${marca.id}/activar`);
            }
            fetchMarcas();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta marca?")) return;
        try {
            await adminApi.delete(`/marcas/${id}`);
            fetchMarcas();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={sharedStyles.container}>
            <div className={sharedStyles.header}>
                <h1>Marcas</h1>
                <button id="marcas-new-btn" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`} onClick={() => {
                    setFormData({ id: null, nombre: '', slug: '', descripcion: '', imagen_url: '', is_active: true });
                    setModalOpen(true);
                }}>Nueva Marca</button>
            </div>
            
            <table className={sharedStyles.table}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Slug</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {marcas.map(marca => (
                        <tr key={marca.id}>
                            <td>{marca.nombre}</td>
                            <td>{marca.slug}</td>
                            <td>{marca.descripcion}</td>
                            <td>
                                <span className={marca.is_active ? sharedStyles.badgeGreen : sharedStyles.badgeRed}>
                                    {marca.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>
                                <button className={sharedStyles.actionBtnEdit} onClick={() => handleEdit(marca)}>✏️ Editar</button>
                                <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(marca)}>
                                    {marca.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                                {admin?.is_superadmin && (
                                    <button className={sharedStyles.actionBtnDelete} onClick={() => handleDelete(marca.id)}>🗑️ Eliminar</button>
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
                        {formData.id ? '✏️ Editar Marca' : '➕ Nueva Marca'}
                        {formData.id && <span className={sharedStyles.drawerProductName}>— {formData.nombre}</span>}
                    </div>
                    <button className={sharedStyles.drawerClose} onClick={() => setModalOpen(false)}>×</button>
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
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: `1.5px solid ${formData.is_active ? '#2e3b23' : '#e8e8e8'}`, borderRadius: '8px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Marca Activa</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`}>Cancelar</button>
                        <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear Marca'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminMarcas;
