import { useSiteConfig } from '../../hooks/useSiteConfig';
import styles from './Contacto.module.css';

export default function Contacto() {
  const { config } = useSiteConfig();
  const mensaje = encodeURIComponent(config.whatsapp_mensaje);

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
                    href={`https://wa.me/${config.whatsapp_numero}?text=${mensaje}`}
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
                  <p>{config.ubicacion}</p>
                  <p className={styles.small}>{config.envios_descripcion}</p>
                </div>
              </div>

              <div className={styles.card}>
                <span className={styles.cardIcon}>🕐</span>
                <div>
                  <h3>Horarios</h3>
                  <p>{config.horario_semana}</p>
                  <p>{config.horario_sabado}</p>
                </div>
              </div>

              {config.email && (
                <div className={styles.card}>
                  <span className={styles.cardIcon}>✉️</span>
                  <div>
                    <h3>Email</h3>
                    <a
                      href={`mailto:${config.email}`}
                      className={styles.cardLink}
                    >
                      {config.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.waCta}>
            <span className={styles.waIcon}>📱</span>
            <h3>¿Tenés una consulta?</h3>
            <p>Escribinos directamente por WhatsApp para ayudarte con tu pedido o resolver cualquier duda.</p>
            <a
              href={`https://wa.me/${config.whatsapp_numero}?text=${mensaje}`}
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
