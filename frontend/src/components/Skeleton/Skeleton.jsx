import styles from './Skeleton.module.css';

export function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.pulse} ${styles.image}`} />
      <div className={styles.body}>
        <div className={`${styles.pulse} ${styles.line} ${styles.short}`} />
        <div className={`${styles.pulse} ${styles.line} ${styles.long}`} />
        <div className={`${styles.pulse} ${styles.line} ${styles.mid}`} />
        <div className={styles.footer}>
          <div className={`${styles.pulse} ${styles.price}`} />
          <div className={`${styles.pulse} ${styles.btn}`} />
        </div>
      </div>
    </div>
  );
}
