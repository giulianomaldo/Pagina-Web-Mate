import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import { formatCurrency, emojiPorCategoria } from '../../utils/helpers';
import styles from './ProductCard.module.css';

const ProductCard = memo(function ProductCard({ producto }) {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (producto.stock <= 0) return;
    addItem({ ...producto, imagen: producto.imagen_url || producto.imagen });
    toast.success(`${producto.nombre} agregado al carrito`, {
      icon: producto.categoria?.emoji || emojiPorCategoria(producto.categoria),
      duration: 2000,
    });
  };

  return (
    <motion.article
      className={styles.card}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      layout
    >
      <Link to={`/producto/${producto.slug || producto.id}`} className={styles.imageWrapper} aria-label={`Ver detalle de ${producto.nombre}`}>
        {/* Badges */}
        <div className={styles.badges}>
          {(producto.nuevo || producto.is_nuevo) && <Badge variant="nuevo">Nuevo</Badge>}
          {(producto.masVendido || producto.is_mas_vendido) && <Badge variant="masVendido">⭐ Top</Badge>}
          {producto.stock === 0 && <Badge variant="sinStock">Sin stock</Badge>}
        </div>

        <img
          src={producto.imagen_url || producto.imagen}
          alt={producto.nombre}
          className={styles.image}
          loading="lazy"
        />
      </Link>

      <div className={styles.body}>
        <p className={styles.categoria}>
          {producto.categoria?.emoji || emojiPorCategoria(producto.categoria)} {typeof producto.categoria === 'object' ? producto.categoria.nombre : producto.categoria}
        </p>
        <Link to={`/producto/${producto.slug || producto.id}`}>
          <h3 className={styles.nombre}>{producto.nombre}</h3>
        </Link>
        <p className={styles.marca}>{typeof producto.marca === 'object' ? producto.marca.nombre : producto.marca}</p>

        <div className={styles.footer}>
          <span className={styles.precio}>{formatCurrency(producto.precio)}</span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={producto.stock <= 0}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            {producto.stock > 0 ? '+ Agregar' : 'Agotado'}
          </Button>
        </div>
      </div>
    </motion.article>
  );
});

export default ProductCard;
