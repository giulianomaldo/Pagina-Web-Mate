import React, { useState, useEffect } from 'react';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminBanners.module.css';
import { adminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const AdminBanners = () => {
    const { admin } = useAuth();
    const [banners, setBanners] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null, titulo: '', subtitulo: '', link_url: '', link_label: '', posicion: 'hero', orden: 0, fecha_inicio: '', fecha_fin: '', is_active: true
    });
    const [imageFile, setImageFile] = useState(null);

    const fetchBanners = async () => {
        try {
            const res = await adminApi.get('/banners?includeInactive=true');
            setBanners(res.data?.banners || res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            for (let key in formData) {
                if (formData[key] !== null && formData[key] !== undefined) {
                    fd.append(key, formData[key]);
                }
            }
            if (imageFile) {
                fd.append('imagen', imageFile);
            }

            if (formData.id) {
                await adminApi.put(`/banners/${formData.id}`, fd);
            } else {
                await adminApi.post('/banners', fd);
            }
            setModalOpen(false);
            setImageFile(null);
            fetchBanners();
        } catch (error) {
            let errorMsg = error.data?.message || error.message || 'Error al guardar';
            if (error.data?.errors && Array.isArray(error.data.errors)) {
                errorMsg = error.data.errors.map(e => e.mensaje || e.msg).join(' - ');
            }
            alert(`❌ Error: ${errorMsg}`);
            console.error(error);
        }
    };

    const handleEdit = (banner) => {
        setFormData({
            ...banner,
            fecha_inicio: banner.fecha_inicio ? banner.fecha_inicio.split('T')[0] : '',
            fecha_fin: banner.fecha_fin ? banner.fecha_fin.split('T')[0] : ''
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleToggleActive = async (banner) => {
        try {
            if (banner.is_active) {
                await adminApi.patch(`/banners/${banner.id}/desactivar`);
            } else {
                await adminApi.patch(`/banners/${banner.id}/activar`);
            }
            fetchBanners();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este banner?")) return;
        try {
            await adminApi.delete(`/banners/${id}`);
            fetchBanners();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={sharedStyles.container}>
            <div className={sharedStyles.header}>
                <h1>Banners</h1>
                <button id="banners-new-btn" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`} onClick={() => {
                    setFormData({ id: null, titulo: '', subtitulo: '', link_url: '', link_label: '', posicion: 'hero', orden: 0, fecha_inicio: '', fecha_fin: '', is_active: true });
                    setImageFile(null);
                    setModalOpen(true);
                }}>Nuevo Banner</button>
            </div>
            
            <table className={sharedStyles.table}>
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Título</th>
                        <th>Posición</th>
                        <th>Orden</th>
                        <th>Vigencia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.map(banner => (
                        <tr key={banner.id}>
                            <td>
                                {banner.imagen_url && <img src={banner.imagen_url} alt="banner" style={{ width: '100px', objectFit: 'cover' }} />}
                            </td>
                            <td>{banner.titulo}</td>
                            <td>{banner.posicion}</td>
                            <td>{banner.orden}</td>
                            <td>
                                {(banner.fecha_inicio || banner.fecha_fin) ? 
                                    `${banner.fecha_inicio ? banner.fecha_inicio.split('T')[0] : '...'} / ${banner.fecha_fin ? banner.fecha_fin.split('T')[0] : '...'}` 
                                    : 'Siempre'}
                            </td>
                            <td>
                                <span className={banner.is_active ? sharedStyles.badgeGreen : sharedStyles.badgeRed}>
                                    {banner.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>
                                <button className={sharedStyles.actionBtnEdit} onClick={() => handleEdit(banner)}>✏️ Editar</button>
                                <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(banner)}>
                                    {banner.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                                {admin?.is_superadmin && (
                                    <button className={sharedStyles.actionBtnDelete} onClick={() => handleDelete(banner.id)}>🗑️ Eliminar</button>
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
                        {formData.id ? '✏️ Editar Banner' : '➕ Nuevo Banner'}
                    </div>
                    <button type="button" className={sharedStyles.drawerClose} onClick={() => setModalOpen(false)}>×</button>
                </div>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className={sharedStyles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto' }}>
                        <div className={sharedStyles.formGrid2}>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Título</label>
                                <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Subtítulo</label>
                                <input type="text" name="subtitulo" value={formData.subtitulo} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Link URL</label>
                                <input type="text" name="link_url" value={formData.link_url} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Link Label</label>
                                <input type="text" name="link_label" value={formData.link_label} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Fecha Inicio</label>
                                <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Fecha Fin</label>
                                <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Posición</label>
                                <select name="posicion" value={formData.posicion} onChange={handleFormChange} className={sharedStyles.select}>
                                    <option value="hero">Hero</option>
                                    <option value="mid">Mid</option>
                                    <option value="lateral">Lateral</option>
                                    <option value="popup">Popup</option>
                                </select>
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label className={sharedStyles.label}>Orden</label>
                                <input type="number" name="orden" value={formData.orden} onChange={handleFormChange} className={sharedStyles.input} />
                            </div>
                        </div>
                        <div className={sharedStyles.formGroupFull} style={{ marginTop: '1rem' }}>
                            <label className={sharedStyles.label}>Imagen</label>
                            <input type="file" name="imagen" onChange={handleImageChange} accept="image/*" />
                            {formData.imagen_url && !imageFile && <p style={{marginTop:'0.5rem', fontSize:'0.8rem'}}>Imagen actual: <img src={formData.imagen_url} alt="preview" style={{width:'80px', display:'block', marginTop:'0.25rem', borderRadius:'4px'}} /></p>}
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: formData.is_active ? '#f0fdf4' : '#fff', border: `1.5px solid ${formData.is_active ? '#2e3b23' : '#e8e8e8'}`, borderRadius: '8px' }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFormChange} style={{ width: '18px', height: '18px', accentColor: '#2e3b23' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>🟢 Banner Activo</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={sharedStyles.drawerFooter}>
                        <button type="button" onClick={() => setModalOpen(false)} className={`${sharedStyles.btn} ${sharedStyles.btnGhost}`}>Cancelar</button>
                        <button type="submit" className={`${sharedStyles.btn} ${sharedStyles.btnPrimary}`}>{formData.id ? '✅ Guardar Cambios' : '✅ Crear Banner'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBanners;
