import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { formatCurrency, generarMensajeWhatsApp } from '../../utils/helpers';
import { WHATSAPP_NUMBER } from '../../utils/constants';
import Button from '../Button/Button';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    isOpen, closeDrawer,
    items, totalPrice, totalItems,
    removeItem, increment, decrement, clearCart,
  } = useCart();

  const handleFinalizarPedido = () => {
    if (items.length === 0) return;
    const mensaje = generarMensajeWhatsApp(items, totalPrice);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32 }}
            role="dialog"
            aria-label="Carrito de compras"
            aria-modal="true"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h2 className={styles.title}>Tu Pedido</h2>
                {totalItems > 0 && (
                  <span className={styles.count}>{totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}</span>
                )}
              </div>
              <button className={styles.closeBtn} onClick={closeDrawer} aria-label="Cerrar carrito">✕</button>
            </div>

            {/* Contenido */}
            {items.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🛒</span>
                <p className={styles.emptyTitle}>Tu carrito está vacío</p>
                <p className={styles.emptyDesc}>Agregá productos para comenzar tu pedido</p>
                <Button variant="secondary" onClick={closeDrawer}>Ver catálogo</Button>
              </div>
            ) : (
              <>
                {/* Lista */}
                <ul className={styles.list}>
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        className={styles.item}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img src={item.imagen} alt={item.nombre} className={styles.itemImg} />
                        <div className={styles.itemInfo}>
                          <p className={styles.itemName}>{item.nombre}</p>
                          <p className={styles.itemPrice}>{formatCurrency(item.precio)}</p>
                          <div className={styles.itemControls}>
                            <button onClick={() => decrement(item.id)} aria-label="Disminuir cantidad" className={styles.qtyBtn}>−</button>
                            <span className={styles.qty}>{item.cantidad}</span>
                            <button onClick={() => increment(item.id)} aria-label="Aumentar cantidad" className={styles.qtyBtn} disabled={item.cantidad >= item.stock}>+</button>
                          </div>
                        </div>
                        <div className={styles.itemRight}>
                          <p className={styles.itemSubtotal}>{formatCurrency(item.precio * item.cantidad)}</p>
                          <button onClick={() => removeItem(item.id)} className={styles.removeBtn} aria-label={`Eliminar ${item.nombre}`}>🗑</button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {/* Footer con totales */}
                <div className={styles.footer}>
                  <button className={styles.clearBtn} onClick={clearCart}>Vaciar carrito</button>
                  <div className={styles.total}>
                    <span>Total</span>
                    <span className={styles.totalAmount}>{formatCurrency(totalPrice)}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleFinalizarPedido}
                    aria-label="Finalizar pedido por WhatsApp"
                  >
                    <WhatsAppIcon /> Finalizar por WhatsApp
                  </Button>
                  <p className={styles.disclaimer}>
                    Al confirmar se abrirá WhatsApp para coordinar el pago y la entrega.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
  </svg>
);
