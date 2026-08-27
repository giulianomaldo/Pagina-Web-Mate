import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import ProductCard from '../../components/ProductCard/ProductCard';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import styles from './ProductoDetalle.module.css';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, openDrawer } = useCart();

  const [producto, setProducto]   = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [imgActiva, setImgActiva] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Intenta buscar por slug primero, luego por id
    api.get(`/productos/${id}`)
      .then(res => {
        if (cancelled) return;
        const p = res?.data?.producto || null;
        setProducto(p);
        if (p?.categoria?.slug) {
          return api.get(`/productos?categoria=${p.categoria.slug}&limit=5`);
        }
      })
      .then(res => {
        if (cancelled || !res) return;
        const todos = res?.data?.productos || [];
        setRelacionados(todos.filter(p => String(p.id) !== String(id)).slice(0, 4));
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return (
    <div className={styles.notFound}>
      <p className={styles.notFoundIcon}>⏳</p>
      <h2>Cargando producto...</h2>
    </div>
  );

  if (error || !producto) return (
    <div className={styles.notFound}>
      <p className={styles.notFoundIcon}>😕</p>
      <h2>Producto no encontrado</h2>
      <Button variant="primary" onClick={() => navigate('/productos')}>Ver catálogo</Button>
    </div>
  );

  const imagenes = producto.imagenes?.length > 0
    ? producto.imagenes
    : [producto.imagen_url].filter(Boolean);
  if (imagenes.length === 0) imagenes.push('https://via.placeholder.com/400x400?text=Sin+imagen');

  const handleAgregar = () => {
    addItem({ ...producto, imagen: producto.imagen_url });
    toast.success(`${producto.nombre} agregado al carrito`, { icon: producto.categoria?.emoji || '🛍️' });
    openDrawer();
  };

  return (
    <motion.div
      className={`container ${styles.page}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span aria-hidden>›</span>
        <Link to="/productos">Productos</Link>
        <span aria-hidden>›</span>
        <span>{producto.nombre}</span>
      </nav>

      {/* Detalle */}
      <div className={styles.grid}>
        {/* Galería */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <motion.img
              key={imgActiva}
              src={imagenes[imgActiva]}
              alt={producto.nombre}
              className={styles.imgMain}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {imagenes.length > 1 && (
            <div className={styles.thumbs}>
              {imagenes.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgActiva(i)}
                  className={`${styles.thumb} ${i === imgActiva ? styles.thumbActive : ''}`}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={img} alt={`${producto.nombre} vista ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.badges}>
            {producto.is_nuevo      && <Badge variant="nuevo">Nuevo</Badge>}
            {producto.is_mas_vendido && <Badge variant="masVendido">⭐ Top Ventas</Badge>}
          </div>

          <p className={styles.categoria}>
            {producto.categoria?.emoji} {producto.categoria?.nombre} — {producto.tipo}
          </p>

          <h1 className={styles.nombre}>{producto.nombre}</h1>
          <p className={styles.marca}>por {producto.marca?.nombre}</p>
          <p className={styles.descripcion}>{producto.descripcion}</p>

          <div className={styles.precioRow}>
            <span className={styles.precio}>{formatCurrency(producto.precio)}</span>
            <span className={`${styles.stock} ${producto.stock === 0 ? styles.sinStock : ''}`}>
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock'}
            </span>
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary" size="lg" fullWidth
              onClick={handleAgregar}
              disabled={producto.stock === 0}
              aria-label={`Agregar ${producto.nombre} al carrito`}
            >
              {producto.stock > 0 ? '+ Agregar al carrito' : 'Sin stock'}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/productos')}>
              Ver más productos
            </Button>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <section className={styles.relacionados} aria-labelledby="relacionados-titulo">
          <h2 id="relacionados-titulo" className={styles.relTitle}>También te puede interesar</h2>
          <div className={styles.relGrid}>
            {relacionados.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
