import { lazy, Suspense } from 'react';
import Hero from './sections/Hero';
import Categorias from './sections/Categorias';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import styles from './Home.module.css';

const ProductosDestacados = lazy(() => import('./sections/ProductosDestacados'));

function LoadingGrid() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Categorias />
      <section className={styles.destacados}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Destacados de la semana</h2>
          <p className={styles.sectionSub}>Una selección especial para los más exigentes</p>
          <Suspense fallback={<LoadingGrid />}>
            <ProductosDestacados />
          </Suspense>
        </div>
      </section>
    </>
  );
}
