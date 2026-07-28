import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIAS } from '../../../utils/constants';
import styles from './Categorias.module.css';

const IMAGENES = {
  mates:     'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80',
  blends:    'https://images.unsplash.com/photo-1597481499750-3e6b22637536?w=500&q=80',
  yerbas:    'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=500&q=80',
  termos:    'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=500&q=80',
  bombillas: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
};

export default function Categorias() {
  return (
    <section className={styles.section} aria-labelledby="categorias-titulo">
      <div className="container">
        <h2 id="categorias-titulo" className={styles.title}>Explorar por categoría</h2>
        <div className={styles.grid}>
          {CATEGORIAS.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                to={`/productos?categoria=${cat.id}`}
                className={styles.card}
                aria-label={`Ver ${cat.label}`}
              >
                <div className={styles.imageWrap}>
                  <img src={IMAGENES[cat.id]} alt={cat.label} className={styles.image} loading="lazy" />
                  <div className={styles.overlay} aria-hidden="true" />
                </div>
                <div className={styles.info}>
                  <span className={styles.emoji}>{cat.emoji}</span>
                  <span className={styles.label}>{cat.label}</span>
                  <span className={styles.desc}>{cat.descripcion}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
