import { Link } from 'react-router-dom';
import { useProductos } from '../../../hooks/useProductos';
import ProductGrid from '../../../components/ProductGrid/ProductGrid';
import styles from './ProductosDestacados.module.css';

export default function ProductosDestacados() {
  const { productos, loading, error } = useProductos({ destacado: true, limit: 4 });

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
      Cargando productos...
    </div>
  );

  if (error) return (
    <div style={{ padding: '1rem', color: '#c00', textAlign: 'center' }}>
      No se pudieron cargar los productos destacados.
    </div>
  );

  // Filtro cliente como fallback por si el backend no filtra por destacado
  const destacados = productos.filter(p => p.is_destacado).slice(0, 4);
  // Si el backend ya filtró, usamos todos (hasta 4)
  const lista = destacados.length > 0 ? destacados : productos.slice(0, 4);

  return (
    <div>
      <ProductGrid productos={lista} />
      <div className={styles.cta}>
        <Link to="/productos" className={styles.ctaLink}>
          Ver todos los productos →
        </Link>
      </div>
    </div>
  );
}
