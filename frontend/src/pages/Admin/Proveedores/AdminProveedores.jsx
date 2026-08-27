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
        id: null, nombre: '', nombre_contacto: '', email: '', telefono: '', direccion: '', notas: '', is_active: true
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
            console.error(error);
        }
    };

    const handleEdit = (prov) => {
        setFormData(prov);
        setModalOpen(true);
    };

    const handleToggleActive = async (prov) => {
        try {
            const ep = prov.is_active ? `/proveedores/${prov.id}/desactivar` : `/proveedores/${prov.id}/activar`;
            await adminApi.patch(ep);
            fetchProveedores();
        } catch (error) {
            // fallback: update via PUT
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
                <button id="proveedores-new-btn" className={sharedStyles.btnPrimary} onClick={() => {
                    setFormData({ id: null, nombre: '', nombre_contacto: '', email: '', telefono: '', direccion: '', notas: '', is_active: true });
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
                            <td>{prov.nombre_contacto}</td>
                            <td>{prov.email}</td>
                            <td>{prov.telefono}</td>
                            <td>
                                <span className={prov.is_active ? sharedStyles.badgeGreen : sharedStyles.badgeRed}>
                                    {prov.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>
                                <button className={sharedStyles.btnAction} onClick={() => handleEdit(prov)}>Editar</button>
                                <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(prov)}>
                                    {prov.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                                {admin?.is_superadmin && (
                                    <button className={sharedStyles.btnActionDelete} onClick={() => handleDelete(prov.id)}>Eliminar</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className={sharedStyles.modalOverlay}>
                    <div className={sharedStyles.modal}>
                        <h2>{formData.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                        <form onSubmit={handleSave}>
                            <div className={sharedStyles.formGroup}>
                                <label>Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Contacto</label>
                                <input type="text" name="nombre_contacto" value={formData.nombre_contacto} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Teléfono</label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Dirección</label>
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Notas</label>
                                <textarea name="notas" value={formData.notas} onChange={handleFormChange}></textarea>
                            </div>
                            <div className={sharedStyles.formGroupCheckbox}>
                                <label>
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} />
                                    Activo
                                </label>
                            </div>
                            <div className={sharedStyles.modalActions}>
                                <button type="button" onClick={() => setModalOpen(false)} className={sharedStyles.btnSecondary}>Cancelar</button>
                                <button type="submit" className={sharedStyles.btnPrimary}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProveedores;
