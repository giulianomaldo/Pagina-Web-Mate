import React, { useState, useEffect, useRef } from 'react';
import sharedStyles from '../admin.shared.module.css';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const AdminCategorias = () => {
    const { admin } = useAuth();
    const [categorias, setCategorias] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        id: null, nombre: '', slug: '', emoji: '', descripcion: '', orden: 0, parent_id: '', is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    const fetchCategorias = async () => {
        try {
            const res = await adminApi.get('/categorias?includeInactive=true');
            setCategorias(res.data.categorias || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchCategorias(); }, []);

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            const nextData = { ...prev, [name]: newValue };
            if (name === 'nombre' && !prev.id) {
                nextData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
            }
            return nextData;
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            // Siempre usar FormData para soportar imagen
            const fd = new FormData();
            fd.append('nombre', formData.nombre);
            fd.append('slug', formData.slug);
            fd.append('emoji', formData.emoji || '');
            fd.append('descripcion', formData.descripcion || '');
            fd.append('orden', formData.orden || 0);
            fd.append('is_active', formData.is_active ? 'true' : 'false');
            if (formData.parent_id) fd.append('parent_id', formData.parent_id);
            if (imageFile) fd.append('imagen', imageFile);

            if (formData.id) {
                await adminApi.put(`/categorias/${formData.id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await adminApi.post('/categorias', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setModalOpen(false);
            fetchCategorias();
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (cat) => {
        setFormData({ ...cat, parent_id: cat.parent_id || '' });
        setImageFile(null);
        setImagePreview(cat.imagen_url || '');
        setError('');
        setModalOpen(true);
    };

    const handleNew = () => {
        setFormData({ id: null, nombre: '', slug: '', emoji: '', descripcion: '', orden: 0, parent_id: '', is_active: true });
        setImageFile(null);
        setImagePreview('');
        setError('');
        setModalOpen(true);
    };

    const handleToggleActive = async (cat) => {
        try {
            const endpoint = cat.is_active ? `/categorias/${cat.id}/desactivar` : `/categorias/${cat.id}/activar`;
            await adminApi.patch(endpoint);
            fetchCategorias();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
        try {
            await adminApi.delete(`/categorias/${id}`);
            fetchCategorias();
        } catch (error) { console.error(error); }
    };

    const filtered = categorias.filter(c => c.nombre?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className={sharedStyles.container}>
            <div className={sharedStyles.header}>
                <h1>Categorías</h1>
                <button id="categorias-new-btn" className={sharedStyles.btnPrimary} onClick={handleNew}>
                    + Nueva Categoría
                </button>
            </div>

            <input
                id="categorias-search"
                type="text"
                placeholder="Buscar categoría..."
                value={search}
                onChange={handleSearchChange}
                className={sharedStyles.searchInput}
            />

            <div className={sharedStyles.tableWrap}>
                <table className={sharedStyles.table}>
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Emoji</th>
                            <th>Nombre</th>
                            <th>Slug</th>
                            <th>Orden</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="7" className={sharedStyles.emptyState}>No hay categorías.</td></tr>
                        ) : filtered.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    {cat.imagen_url
                                        ? <img src={cat.imagen_url} alt={cat.nombre} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                                        : <span style={{ color: '#aaa', fontSize: 12 }}>Sin imagen</span>
                                    }
                                </td>
                                <td>{cat.emoji}</td>
                                <td><strong>{cat.nombre}</strong></td>
                                <td style={{ fontSize: 12, color: '#888' }}>{cat.slug}</td>
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
                                    {admin?.rol === 'superadmin' && (
                                        <button className={sharedStyles.btnActionDelete} onClick={() => handleDelete(cat.id)}>Eliminar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className={sharedStyles.modalOverlay}>
                    <div className={sharedStyles.modal}>
                        <h2>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        <form onSubmit={handleSave}>
                            <div className={sharedStyles.formGroup}>
                                <label>Nombre *</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Slug</label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Emoji</label>
                                <input type="text" name="emoji" value={formData.emoji} onChange={handleFormChange} placeholder="🌿" />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleFormChange} rows={3} />
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
                            <div className={sharedStyles.formGroup}>
                                <label>Imagen</label>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                                    />
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImageChange}
                                    style={{ width: '100%' }}
                                />
                                <small style={{ color: '#888' }}>PNG, JPG o WEBP — máx. 5MB</small>
                            </div>
                            <div className={sharedStyles.formGroupCheckbox}>
                                <label>
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} />
                                    &nbsp;Activo
                                </label>
                            </div>
                            {error && <p style={{ color: 'red', fontSize: 13 }}>⚠️ {error}</p>}
                            <div className={sharedStyles.modalActions}>
                                <button type="button" onClick={() => setModalOpen(false)} className={sharedStyles.btnSecondary}>Cancelar</button>
                                <button type="submit" className={sharedStyles.btnPrimary} disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategorias;
