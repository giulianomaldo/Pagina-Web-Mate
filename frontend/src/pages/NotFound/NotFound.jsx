import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Página no encontrada</h1>
      <p className={styles.desc}>Ups, parece que esta página no existe o fue movida.</p>
      <Link to="/" className={styles.btn}>← Volver al inicio</Link>
    </motion.div>
  );
}
