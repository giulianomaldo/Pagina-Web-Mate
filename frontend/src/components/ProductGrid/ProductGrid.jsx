import { motion } from 'framer-motion';
import ProductCard from '../ProductCard/ProductCard';
import { SkeletonCard } from '../Skeleton/Skeleton';
import styles from './ProductGrid.module.css';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function ProductGrid({ productos, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.grid} aria-label="Cargando productos">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🔍</span>
        <h3 className={styles.emptyTitle}>Sin resultados</h3>
        <p className={styles.emptyDesc}>Probá con otros filtros o términos de búsqueda.</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.grid}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      key={productos.length}
    >
      {productos.map((producto) => (
        <motion.div key={producto.id} variants={itemVariants}>
          <ProductCard producto={producto} />
        </motion.div>
      ))}
    </motion.div>
  );
}
