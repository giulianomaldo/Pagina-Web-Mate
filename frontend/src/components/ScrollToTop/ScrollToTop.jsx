import { motion, AnimatePresence } from 'framer-motion';
import { useScrollTop } from '../../hooks/useScrollTop';
import styles from './ScrollToTop.module.css';

export default function ScrollToTop() {
  const { visible, scrollToTop } = useScrollTop(400);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className={styles.btn}
          onClick={scrollToTop}
          aria-label="Volver al inicio"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
