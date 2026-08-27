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
                await adminApi.put(`/banners/${formData.id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await adminApi.post('/banners', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setModalOpen(false);
            setImageFile(null);
            fetchBanners();
        } catch (error) {
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
                                <button className={sharedStyles.btnAction} onClick={() => handleEdit(banner)}>Editar</button>
                                <button className={sharedStyles.btnAction} onClick={() => handleToggleActive(banner)}>
                                    {banner.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                                {admin?.is_superadmin && (
                                    <button className={sharedStyles.btnActionDelete} onClick={() => handleDelete(banner.id)}>Eliminar</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className={sharedStyles.modalOverlay}>
                    <div className={sharedStyles.modal}>
                        <h2>{formData.id ? 'Editar Banner' : 'Nuevo Banner'}</h2>
                        <form onSubmit={handleSave}>
                            <div className={sharedStyles.formGroup}>
                                <label>Título</label>
                                <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Subtítulo</label>
                                <input type="text" name="subtitulo" value={formData.subtitulo} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Imagen</label>
                                <input type="file" name="imagen" onChange={handleImageChange} accept="image/*" />
                                {formData.imagen_url && !imageFile && <p>Imagen actual: <img src={formData.imagen_url} alt="preview" style={{width:'50px'}} /></p>}
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Link URL</label>
                                <input type="text" name="link_url" value={formData.link_url} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Link Label (Texto del botón)</label>
                                <input type="text" name="link_label" value={formData.link_label} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Posición</label>
                                <select name="posicion" value={formData.posicion} onChange={handleFormChange}>
                                    <option value="hero">Hero</option>
                                    <option value="mid">Mid</option>
                                    <option value="lateral">Lateral</option>
                                    <option value="popup">Popup</option>
                                </select>
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Orden</label>
                                <input type="number" name="orden" value={formData.orden} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Fecha Inicio</label>
                                <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleFormChange} />
                            </div>
                            <div className={sharedStyles.formGroup}>
                                <label>Fecha Fin</label>
                                <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleFormChange} />
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

export default AdminBanners;
