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
                                <button className={sharedStyles.btnAction} onClick={() => handleEdit(cat)}>Editar</button>
                                <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(cat)}>
                                    {cat.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                                {admin?.is_superadmin && (
                                    <button className={sharedStyles.btnActionDelete} onClick={() => handleDelete(cat.id)}>Eliminar</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className={sharedStyles.modalOverlay}>
                    <div className={sharedStyles.modal}>
                        <h2>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
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
                                <label>Emoji</label>
                                <input type="text" name="emoji" value={formData.emoji} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleFormChange}></textarea>
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Orden</label>
                                <input type="number" name="orden" value={formData.orden} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Categoría Padre</label>
                                <select name="parent_id" value={formData.parent_id} onChange={handleFormChange}>
                                    <option value="">Ninguna</option>
                                    {categorias.filter(c => c.id !== formData.id).map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
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

export default AdminCategorias;
