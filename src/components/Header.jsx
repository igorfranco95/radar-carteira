import styles from './Header.module.css'

export default function Header({ date, positiveCount, negativeCount, updatedAt }) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          <span className={styles.title}>RADAR DE CARTEIRA</span>
        </div>
        <span className={styles.date}>{date}</span>
      </div>
      <div className={styles.stats}>
        <span className={styles.pos}>▲ {positiveCount} EM ALTA</span>
        <span className={styles.divider}>|</span>
        <span className={styles.neg}>▼ {negativeCount} EM QUEDA</span>
        <span className={styles.divider}>|</span>
        <span className={styles.time}>{updatedAt}</span>
      </div>
    </header>
  )
}
