import { Link } from 'react-router-dom';
import productos from '../../../data/productos.json';
import ProductGrid from '../../../components/ProductGrid/ProductGrid';
import styles from './ProductosDestacados.module.css';

export default function ProductosDestacados() {
  const destacados = productos.filter((p) => p.destacado).slice(0, 4);

  return (
    <div>
      <ProductGrid productos={destacados} />
      <div className={styles.cta}>
        <Link to="/productos" className={styles.ctaLink}>
          Ver todos los productos →
        </Link>
      </div>
    </div>
  );
}
