import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Sección principal">
      {/* Imagen de fondo */}
      <div className={styles.bg} aria-hidden="true" />

      {/* Contenido */}
      <div className={`container ${styles.content}`}>
        <motion.p
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          🌿 Desde el corazón de Encontrarte Infusiones
        </motion.p>

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          El mate perfecto,<br />
          <em>cada mañana.</em>
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Mates artesanales, yerbas premium, blends únicos y accesorios<br className={styles.br} /> para una experiencia inigualable.
        </motion.p>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link to="/productos" className={styles.btnPrimary} id="hero-cta">
            Ver catálogo
          </Link>
          <Link to="/nosotros" className={styles.btnSecondary}>
            Conocenos
          </Link>
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        className={styles.scrollHint}
        aria-hidden="true"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ↓
      </motion.div>
    </section>
  );
}
