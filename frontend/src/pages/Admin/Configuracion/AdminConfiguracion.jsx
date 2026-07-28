import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../utils/api';
import sharedStyles from '../admin.shared.module.css';
import styles from './AdminConfiguracion.module.css';

const AdminConfiguracion = () => {
  const [formData, setFormData] = useState({
    whatsapp_numero: '',
    whatsapp_mensaje: '',
    ubicacion: '',
    horario_semana: '',
    horario_sabado: '',
    email: '',
    envios_descripcion: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/configuracion');
      if (res.data?.configuracion) {
        setFormData(res.data.configuracion);
      } else if (res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al cargar la configuración.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.put('/configuracion', formData);
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={sharedStyles.container}>
      <header className={sharedStyles.header}>
        <h1>Configuración de Contacto</h1>
      </header>
      
      <div className={styles.infoBox}>
        Los cambios se reflejan automáticamente en la página de Contacto del sitio.
      </div>

      {message && (
        <div className={message.type === 'success' ? styles.alertSuccess : styles.alertError}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className={styles.layout}>
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Número de WhatsApp:</label>
                <input 
                  type="text" 
                  name="whatsapp_numero" 
                  id="config-whatsapp-numero"
                  value={formData.whatsapp_numero || ''} 
                  onChange={handleChange} 
                />
                <span className={styles.helperText}>Formato: código país + número sin +. Ej: 5491100000000</span>
              </div>
              
              <div className={styles.formGroup}>
                <label>Mensaje default WA:</label>
                <textarea 
                  name="whatsapp_mensaje" 
                  value={formData.whatsapp_mensaje || ''} 
                  onChange={handleChange} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ubicación:</label>
                <input 
                  type="text" 
                  name="ubicacion" 
                  value={formData.ubicacion || ''} 
                  onChange={handleChange} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Horario Lun-Vie:</label>
                <input 
                  type="text" 
                  name="horario_semana" 
                  value={formData.horario_semana || ''} 
                  onChange={handleChange} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Horario Sábado:</label>
                <input 
                  type="text" 
                  name="horario_sabado" 
                  value={formData.horario_sabado || ''} 
                  onChange={handleChange} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email de contacto:</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email || ''} 
                  onChange={handleChange} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descripción envíos:</label>
                <input 
                  type="text" 
                  name="envios_descripcion" 
                  value={formData.envios_descripcion || ''} 
                  onChange={handleChange} 
                />
              </div>

              <button 
                type="submit" 
                id="config-save-btn" 
                className={sharedStyles.primaryBtn} 
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

          <div className={styles.previewContainer}>
            <h3>Vista Previa</h3>
            <div className={styles.previewCard}>
              <h4>Contacto</h4>
              <p><strong>WhatsApp:</strong> +{formData.whatsapp_numero}</p>
              <p className={styles.previewMessage}>"{formData.whatsapp_mensaje}"</p>
              <p><strong>Email:</strong> {formData.email}</p>
              
              <h4>Ubicación y Horarios</h4>
              <p>{formData.ubicacion}</p>
              <p>Lun - Vie: {formData.horario_semana}</p>
              <p>Sáb: {formData.horario_sabado}</p>

              <h4>Envíos</h4>
              <p>{formData.envios_descripcion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfiguracion;
