import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const DEFAULTS = {
  whatsapp_numero:    '5491100000000',
  whatsapp_mensaje:   'Hola! Quiero hacer una consulta sobre sus productos 🌿',
  ubicacion:          'Buenos Aires, Argentina',
  horario_semana:     'Lun–Vie: 9:00 a 18:00',
  horario_sabado:     'Sáb: 9:00 a 13:00',
  email:              '',
  envios_descripcion: 'Envíos a todo el país',
};

// Cache simple en memoria para evitar múltiples requests simultáneos
let cachedConfig = null;
let fetchPromise = null;

/**
 * useSiteConfig — Hook para acceder a la configuración dinámica del sitio.
 * Lee de la API /configuracion y cachea el resultado en memoria.
 * Si la API falla, retorna los valores por defecto.
 */
export function useSiteConfig() {
  const [config, setConfig] = useState(cachedConfig || DEFAULTS);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = api.get('/configuracion')
        .then((data) => {
          const merged = { ...DEFAULTS, ...(data?.data?.configuracion || {}) };
          cachedConfig = merged;
          return merged;
        })
        .catch(() => {
          cachedConfig = DEFAULTS;
          return DEFAULTS;
        });
    }

    fetchPromise.then((cfg) => {
      setConfig(cfg);
      setLoading(false);
    });
  }, []);

  return { config, loading };
}
