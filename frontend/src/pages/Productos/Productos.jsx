import { useMemo } from 'react';
import productos from '../../data/productos.json';
import { useFiltros } from '../../hooks/useFiltros';
import { CATEGORIAS, ORDENAR_OPTIONS } from '../../utils/constants';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import styles from './Productos.module.css';

export default function Productos() {
  const {
    busqueda, setBusqueda,
    categoria, setCategoria,
    marcas, toggleMarca,
    precioMin, setPrecioMin,
    precioMax, setPrecioMax,
    soloStock, setSoloStock,
    orden, setOrden,
    productosFiltrados,
    resetFiltros,
  } = useFiltros(productos);

  const marcasDisponibles = useMemo(
    () => [...new Set(productos.map((p) => p.marca))].sort(),
    []
  );

  const hayFiltrosActivos = busqueda || categoria || marcas.length > 0 || precioMin || precioMax || soloStock;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Catálogo</h1>
          <p className={styles.subtitle}>{productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}</p>
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
              placeholder="Nombre, marca, tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.catBtn} ${categoria === cat.id ? styles.catActive : ''}`}
                onClick={() => setCategoria(cat.id === categoria ? '' : cat.id)}
                aria-pressed={categoria === cat.id}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Marcas */}
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Marcas</p>
            {marcasDisponibles.map((marca) => (
              <label key={marca} className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={marcas.includes(marca)}
                  onChange={() => toggleMarca(marca)}
                  aria-label={`Filtrar por marca ${marca}`}
                />
                {marca}
              </label>
            ))}
          </div>

          {/* Precio */}
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Precio</p>
            <div className={styles.priceRow}>
              <input
                type="number"
                placeholder="Mín"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                className={styles.priceInput}
                min="0"
                aria-label="Precio mínimo"
              />
              <span className={styles.priceSep}>—</span>
              <input
                type="number"
                placeholder="Máx"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                className={styles.priceInput}
                min="0"
                aria-label="Precio máximo"
              />
            </div>
          </div>

          {/* Stock */}
          <div className={styles.filterGroup}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={soloStock}
                onChange={(e) => setSoloStock(e.target.checked)}
                aria-label="Mostrar solo productos con stock"
              />
              Solo con stock
            </label>
          </div>
        </aside>

        {/* Contenido principal */}
        <div className={styles.main}>
          {/* Barra de orden */}
          <div className={styles.toolbar}>
            <p className={styles.resultCount}>
              {productosFiltrados.length} resultados
            </p>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className={styles.selectOrden}
              aria-label="Ordenar productos"
            >
              {ORDENAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <ProductGrid productos={productosFiltrados} />
        </div>
      </div>
    </div>
  );
}
