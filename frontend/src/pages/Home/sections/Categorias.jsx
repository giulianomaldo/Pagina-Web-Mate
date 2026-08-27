import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategorias } from '../../../hooks/useCategorias';
import styles from './Categorias.module.css';

// Imágenes fallback por slug en caso de que la categoría no tenga imagen_url
const IMAGENES_FALLBACK = {
  mates:     'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80',
  blends:    'https://images.unsplash.com/photo-1597481499750-3e6b22637536?w=500&q=80',
  yerbas:    'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=500&q=80',
  termos:    'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=500&q=80',
  bombillas: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
  accesorios:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
};

export default function Categorias() {
  const { categorias, loading } = useCategorias();

  if (loading) return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>Explorar por categoría</h2>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Cargando categorías...</div>
      </div>
    </section>
  );

  return (
    <section className={styles.section} aria-labelledby="categorias-titulo">
      <div className="container">
        <h2 id="categorias-titulo" className={styles.title}>Explorar por categoría</h2>
        <div className={styles.grid}>
          {categorias.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                to={`/productos?categoria=${cat.slug}`}
                className={styles.card}
                aria-label={`Ver ${cat.nombre}`}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={cat.imagen_url || IMAGENES_FALLBACK[cat.slug] || IMAGENES_FALLBACK.mates}
                    alt={cat.nombre}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.overlay} aria-hidden="true" />
                </div>
                <div className={styles.info}>
                  <span className={styles.emoji}>{cat.emoji}</span>
                  <span className={styles.label}>{cat.nombre}</span>
                  <span className={styles.desc}>{cat.descripcion || ''}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
