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

            {modalOpen && (
                <div className={sharedStyles.modalOverlay}>
                    <div className={sharedStyles.modal}>
                        <h2>{formData.id ? 'Editar Marca' : 'Nueva Marca'}</h2>
                        <form onSubmit={handleSave}>
                            <div className={sharedStyles.formGroup}>
                                <label>Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Slug</label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleFormChange}></textarea>
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Imagen URL</label>
                                <input type="text" name="imagen_url" value={formData.imagen_url} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroupCheckbox}>
                                <label>
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} />
                                    Activo
                                </label>
                            </div>
                            <div className={sharedStyles.modalActions}>
                                <button type="button" onClick={() => setModalOpen(false)} className={sharedStyles.btnSecondary}>Cancelar</button>
                                <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMarcas;
