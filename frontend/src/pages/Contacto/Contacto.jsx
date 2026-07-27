import { WHATSAPP_NUMBER } from '../../utils/constants';
import styles from './Contacto.module.css';

export default function Contacto() {
  const mensaje = encodeURIComponent('Hola! Quiero hacer una consulta sobre sus productos 🌿');

  return (
    <div>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Contacto</h1>
          <p className={styles.subtitle}>Estamos para ayudarte</p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.grid}>
          <div className={styles.info}>
            <h2 className={styles.heading}>¿Cómo contactarnos?</h2>
            <p className={styles.text}>
              La forma más rápida es por WhatsApp. Respondemos en el día durante el horario de atención.
            </p>

            <div className={styles.cards}>
              <div className={styles.card}>
                <span className={styles.cardIcon}>💬</span>
                <div>
                  <h3>WhatsApp</h3>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLink}
                    aria-label="Escribirnos por WhatsApp"
                  >
                    Escribirnos ahora →
                  </a>
                </div>
              </div>

              <div className={styles.card}>
                <span className={styles.cardIcon}>📍</span>
                <div>
                  <h3>Ubicación</h3>
                  <p>Buenos Aires, Argentina</p>
                  <p className={styles.small}>Envíos a todo el país</p>
                </div>
              </div>

              <div className={styles.card}>
                <span className={styles.cardIcon}>🕐</span>
                <div>
                  <h3>Horarios</h3>
                  <p>Lun–Vie: 9:00 a 18:00</p>
                  <p>Sáb: 9:00 a 13:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.waCta}>
            <span className={styles.waIcon}>📱</span>
            <h3>¿Tenés una consulta?</h3>
            <p>Escribinos directamente por WhatsApp para ayudarte con tu pedido o resolver cualquier duda.</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waBtn}
              aria-label="Contactar por WhatsApp"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
