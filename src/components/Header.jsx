import styles from './Header.module.css'

export default function Header({ date, positiveCount, negativeCount, updatedAt, isLive, onRefresh }) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={`${styles.dot} ${isLive ? styles.dotLive : ''}`} />
          <span className={styles.title}>RADAR DE CARTEIRA</span>
        </div>
        <div className={styles.actions}>
          <span className={`${styles.badge} ${isLive ? styles.live : styles.snap}`}>
            {isLive ? '● AO VIVO' : '○ 08:30'}
          </span>
          <button className={styles.refresh} onClick={onRefresh} title="Atualizar cotações">
            ⟳
          </button>
        </div>
      </div>
      <div className={styles.stats}>
        <span className={styles.date}>{date}</span>
        <span className={styles.divider}>|</span>
        <span className={styles.pos}>▲ {positiveCount} EM ALTA</span>
        <span className={styles.divider}>|</span>
        <span className={styles.neg}>▼ {negativeCount} EM QUEDA</span>
        <span className={styles.divider}>|</span>
        <span className={styles.time}>{updatedAt}</span>
      </div>
    </header>
  )
}
