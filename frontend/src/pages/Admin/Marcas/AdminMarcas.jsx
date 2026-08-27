import React, { useState, useEffect, useRef } from 'react';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminMarcas.module.css';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const AdminMarcas = () => {
    const { admin } = useAuth();
    const [marcas, setMarcas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        id: null, nombre: '', slug: '', descripcion: '', is_active: true
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('nombre', formData.nombre);
            fd.append('slug', formData.slug);
            fd.append('descripcion', formData.descripcion || '');
            fd.append('is_active', formData.is_active ? 'true' : 'false');
            if (logoFile) fd.append('logo', logoFile);

            if (formData.id) {
                await adminApi.put(`/marcas/${formData.id}`, fd);
            } else {
                await adminApi.post('/marcas', fd);
            }
            setModalOpen(false);
            fetchMarcas();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (marca) => {
        setFormData({ ...marca });
        setLogoFile(null);
        setLogoPreview(marca.logo_url || '');
        setModalOpen(true);
    };

    const handleToggleActive = async (marca) => {
        try {
            const ep = marca.is_active ? `/marcas/${marca.id}/desactivar` : `/marcas/${marca.id}/activar`;
            await adminApi.patch(ep);
            fetchMarcas();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta marca?')) return;
        try {
            await adminApi.delete(`/marcas/${id}`);
            fetchMarcas();
        } catch (error) { console.error(error); }
    };

    return (
        <div className={sharedStyles.container}>
            <div className={sharedStyles.header}>
                <h1>Marcas</h1>
                <button id="marcas-new-btn" className={sharedStyles.btnPrimary} onClick={() => {
                    setFormData({ id: null, nombre: '', slug: '', descripcion: '', is_active: true });
                    setLogoFile(null); setLogoPreview('');
                    setModalOpen(true);
                }}>+ Nueva Marca</button>
            </div>
            
                <div className={sharedStyles.tableWrap}>
                <table className={sharedStyles.table}>
                    <thead>
                        <tr>
                            <th>Logo</th>
                            <th>Nombre</th>
                            <th>Slug</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marcas.map(marca => (
                            <tr key={marca.id}>
                                <td>
                                    {marca.logo_url
                                        ? <img src={marca.logo_url} alt={marca.nombre} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} />
                                        : <span style={{ color: '#aaa', fontSize: 12 }}>Sin logo</span>
                                    }
                                </td>
                                <td><strong>{marca.nombre}</strong></td>
                                <td style={{ fontSize: 12, color: '#888' }}>{marca.slug}</td>
                                <td>
                                    <span className={marca.is_active ? sharedStyles.badgeGreen : sharedStyles.badgeRed}>
                                        {marca.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <button className={sharedStyles.btnAction} onClick={() => handleEdit(marca)}>Editar</button>
                                    <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(marca)}>
                                        {marca.is_active ? 'Desactivar' : 'Activar'}
                                    </button>
                                    {admin?.rol === 'superadmin' && (
                                        <button className={sharedStyles.btnActionDelete} onClick={() => handleDelete(marca.id)}>Eliminar</button>
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
                        <h2>{formData.id ? 'Editar Marca' : 'Nueva Marca'}</h2>
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
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleFormChange} rows={3} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Logo</label>
                                {logoPreview && (
                                    <img src={logoPreview} alt="preview" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 6, marginBottom: 8, display: 'block' }} />
                                )}
                                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} style={{ width: '100%' }} />
                                <small style={{ color: '#888' }}>PNG, JPG o WEBP — máx. 5MB</small>
                            </div>
                            <div className={sharedStyles.formGroupCheckbox}>
                                <label>
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} />
                                    &nbsp;Activo
                                </label>
                            </div>
                            <div className={sharedStyles.modalActions}>
                                <button type="button" onClick={() => setModalOpen(false)} className={sharedStyles.btnSecondary}>Cancelar</button>
                                <button type="submit" className={sharedStyles.btnPrimary} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMarcas;
