import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useProductos(params = {}) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Construir query string desde params object
    const query = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    api.get(`/productos${query}`)
      .then(res => {
        if (!cancelled) {
          setProductos(res?.data?.productos || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { productos, loading, error };
}
