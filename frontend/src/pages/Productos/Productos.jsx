import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { useCategorias } from '../../hooks/useCategorias';
import { ORDENAR_OPTIONS } from '../../utils/constants';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import styles from './Productos.module.css';

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado de filtros — inicializado desde URL params
  const [busqueda, setBusqueda]   = useState(searchParams.get('q') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [precioMin, setPrecioMin] = useState(searchParams.get('precioMin') || '');
  const [precioMax, setPrecioMax] = useState(searchParams.get('precioMax') || '');
  const [soloStock, setSoloStock] = useState(false);
  const [orden, setOrden]         = useState('default');

  // Datos de la API
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const { categorias }            = useCategorias();

  // Fetch productos cada vez que cambian los filtros principales
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (busqueda)  params.set('q', busqueda);
    if (categoria) params.set('categoria', categoria);
    // Solo productos activos con stock visible
    const query = params.toString() ? `?${params.toString()}` : '';
    api.get(`/productos${query}`)
      .then(res => {
        if (!cancelled) {
          setProductos(res?.data?.productos || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [busqueda, categoria]);

  // Filtros y orden aplicados en cliente
  const productosFiltrados = useMemo(() => {
    let lista = [...productos].filter(p => p.is_active !== false);
    if (soloStock)  lista = lista.filter(p => p.stock > 0);
    if (precioMin)  lista = lista.filter(p => p.precio >= Number(precioMin));
    if (precioMax)  lista = lista.filter(p => p.precio <= Number(precioMax));
    switch (orden) {
      case 'precio-asc':  lista.sort((a, b) => a.precio - b.precio); break;
      case 'precio-desc': lista.sort((a, b) => b.precio - a.precio); break;
      case 'nombre-asc':  lista.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'nuevo':       lista.sort((a, b) => (b.is_nuevo ? 1 : 0) - (a.is_nuevo ? 1 : 0)); break;
      default: break;
    }
    return lista;
  }, [productos, soloStock, precioMin, precioMax, orden]);

  const marcasDisponibles = useMemo(
    () => [...new Set(productos.map(p => p.marca?.nombre).filter(Boolean))].sort(),
    [productos]
  );

  const hayFiltrosActivos = busqueda || categoria || precioMin || precioMax || soloStock;

  const resetFiltros = () => {
    setBusqueda(''); setCategoria(''); setPrecioMin(''); setPrecioMax(''); setSoloStock(false); setOrden('default');
    setSearchParams({});
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Catálogo</h1>
          <p className={styles.subtitle}>
            {loading ? 'Cargando...' : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} encontrado${productosFiltrados.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        {/* Sidebar filtros */}
        <aside className={styles.sidebar} aria-label="Filtros de productos">
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Filtros</h2>
            {hayFiltrosActivos && (
              <button className={styles.resetBtn} onClick={resetFiltros}>Limpiar todo</button>
            )}
          </div>

          {/* Búsqueda */}
          <div className={styles.filterGroup}>
            <label htmlFor="search-productos" className={styles.filterLabel}>Buscar</label>
            <input
              id="search-productos"
              type="search"
              placeholder="Nombre, tipo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={styles.searchInput}
              aria-label="Buscar productos"
            />
          </div>

          {/* Categorías */}
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Categoría</p>
            <button
              className={`${styles.catBtn} ${!categoria ? styles.catActive : ''}`}
              onClick={() => setCategoria('')}
            >
              Todas
            </button>
            {categorias.map(cat => (
              <button
                key={cat.id}
                className={`${styles.catBtn} ${categoria === cat.slug ? styles.catActive : ''}`}
                onClick={() => setCategoria(cat.slug === categoria ? '' : cat.slug)}
                aria-pressed={categoria === cat.slug}
              >
                {cat.emoji} {cat.nombre}
              </button>
            ))}
          </div>

          {/* Precio */}
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Precio</p>
            <div className={styles.priceRow}>
              <input type="number" placeholder="Mín" value={precioMin}
                onChange={e => setPrecioMin(e.target.value)}
                className={styles.priceInput} min="0" aria-label="Precio mínimo" />
              <span className={styles.priceSep}>—</span>
              <input type="number" placeholder="Máx" value={precioMax}
                onChange={e => setPrecioMax(e.target.value)}
                className={styles.priceInput} min="0" aria-label="Precio máximo" />
            </div>
          </div>

          {/* Stock */}
          <div className={styles.filterGroup}>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={soloStock}
                onChange={e => setSoloStock(e.target.checked)}
                aria-label="Mostrar solo productos con stock" />
              Solo con stock
            </label>
          </div>
        </aside>

        {/* Contenido principal */}
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.resultCount}>{productosFiltrados.length} resultados</p>
            <select value={orden} onChange={e => setOrden(e.target.value)}
              className={styles.selectOrden} aria-label="Ordenar productos">
              {ORDENAR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {loading && <div style={{ textAlign:'center', padding:'3rem', color:'#666' }}>Cargando productos...</div>}
          {error   && <div style={{ textAlign:'center', padding:'3rem', color:'#c00' }}>Error al cargar productos.</div>}
          {!loading && !error && <ProductGrid productos={productosFiltrados} />}
        </div>
      </div>
    </div>
  );
}
