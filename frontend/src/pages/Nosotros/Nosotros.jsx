import { motion } from 'framer-motion';
import styles from './Nosotros.module.css';

const valores = [
  { emoji: '🌿', titulo: 'Origen', desc: 'Trabajamos con productores locales seleccionados por la calidad de sus yerbas y materiales.' },
  { emoji: '✋', titulo: 'Artesanal', desc: 'Cada mate es torneado y curado a mano. Cada blend es diseñado por nuestros sommelier de té.' },
  { emoji: '❤️', titulo: 'Comunidad', desc: 'Creemos en la cultura del mate como un acto de conexión. Cada pedido llega con amor.' },
];

export default function Nosotros() {
  return (
    <div>
      {/* Hero */}
      <div className={styles.hero}>
        <div className="container">
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Nuestra historia
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Una tienda nacida del amor al mate y a la cultura infusiones.
          </motion.p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Historia */}
        <section className={styles.section}>
          <div className={styles.textBlock}>
            <h2 className={styles.heading}>¿Quiénes somos?</h2>
            <p>
              Encontrarte Infusiones nació con una idea simple: que cada persona pueda encontrar
              el mate o la infusión perfecta para su ritual diario. Somos apasionados de la cultura
              del mate argentino, los blends artesanales y los accesorios de calidad.
            </p>
            <p>
              Viajamos por Misiones, Corrientes y Salta buscando los mejores productores. Cubrimos
              el proceso completo, desde el secado de la yerba hasta el torneado del mate, para
              garantizar que lo que llega a tu mesa sea excepcional.
            </p>
          </div>
          <div className={styles.imageBlock}>
            <img
              src="https://images.unsplash.com/photo-1597481499750-3e6b22637536?w=700&q=80"
              alt="Mate y blend artesanal"
              className={styles.img}
              loading="lazy"
            />
          </div>
        </section>

        {/* Valores */}
        <section className={styles.valores}>
          <h2 className={styles.heading}>Nuestros valores</h2>
          <div className={styles.valoresGrid}>
            {valores.map((v, i) => (
              <motion.div
                key={v.titulo}
                className={styles.valorCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <span className={styles.valorEmoji}>{v.emoji}</span>
                <h3 className={styles.valorTitulo}>{v.titulo}</h3>
                <p className={styles.valorDesc}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
