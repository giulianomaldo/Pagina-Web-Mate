import React, { useState, useEffect } from 'react';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminProveedores.module.css';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const AdminProveedores = () => {
    const { admin } = useAuth();
    const [proveedores, setProveedores] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null, nombre: '', contacto_nombre: '', email: '', telefono: '', direccion: '', notas: '', is_active: true
    });

    const fetchProveedores = async () => {
        try {
            const res = await adminApi.get('/proveedores?includeInactive=true');
            setProveedores(res.data?.proveedores || res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProveedores();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await adminApi.put(`/proveedores/${formData.id}`, formData);
            } else {
                await adminApi.post('/proveedores', formData);
            }
            setModalOpen(false);
            fetchProveedores();
        } catch (error) {
            let errorMsg = error.data?.message || error.message || 'Error al guardar';
            if (error.data?.errors && Array.isArray(error.data.errors)) {
                errorMsg = error.data.errors.map(e => e.mensaje || e.msg).join(' - ');
            }
            alert(`❌ Error: ${errorMsg}`);
            console.error(error);
        }
    };

    const handleEdit = (prov) => {
        setFormData(prov);
        setModalOpen(true);
    };

    const handleToggleActive = async (prov) => {
        try {
            if (prov.is_active) {
                await adminApi.patch(`/proveedores/${prov.id}/desactivar`); // Or put with changed is_active
            } else {
                await adminApi.patch(`/proveedores/${prov.id}/activar`);
            }
            fetchProveedores();
        } catch (error) {
            // fallback if patch active/deactive doesn't exist for proveedores
            try {
                await adminApi.put(`/proveedores/${prov.id}`, { ...prov, is_active: !prov.is_active });
                fetchProveedores();
            } catch(e) { console.error(e); }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este proveedor?")) return;
        try {
            await adminApi.delete(`/proveedores/${id}`);
            fetchProveedores();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={sharedStyles.container}>
            <div className={sharedStyles.header}>
                <h1>Proveedores</h1>
                <button id="proveedores-new-btn" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`} onClick={() => {
                    setFormData({ id: null, nombre: '', contacto_nombre: '', email: '', telefono: '', direccion: '', notas: '', is_active: true });
                    setModalOpen(true);
                }}>Nuevo Proveedor</button>
            </div>
            
            <table className={sharedStyles.table}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Contacto</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {proveedores.map(prov => (
                        <tr key={prov.id}>
                            <td>{prov.nombre}</td>
                            <td>{prov.contacto_nombre}</td>
                            <td>{prov.email}</td>
                            <td>{prov.telefono}</td>
                            <td>
                                <span className={prov.is_active ? sharedStyles.badgeGreen : sharedStyles.badgeRed}>
                                    {prov.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>
                                <button className={sharedStyles.actionBtnEdit} onClick={() => handleEdit(prov)}>✏️ Editar</button>
                                <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(prov)}>
                                    {prov.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                                {admin?.is_superadmin && (
                                    <button className={sharedStyles.actionBtnDelete} onClick={() => handleDelete(prov.id)}>🗑️ Eliminar</button>
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
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: `1.5px solid ${formData.is_active ? '#2e3b23' : '#e8e8e8'}`, borderRadius: '8px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Proveedor Activo</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`}>Cancelar</button>
                        <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear Proveedor'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProveedores;
