import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/categorias')
      .then(res => {
        if (!cancelled) {
          setCategorias(res?.data?.categorias || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  return { categorias, loading, error };
}
