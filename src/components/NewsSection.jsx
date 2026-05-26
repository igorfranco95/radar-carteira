import styles from './NewsSection.module.css'

export default function NewsSection({ news }) {
  if (!news || news.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>NOTÍCIAS</span>
        <span className={styles.count}>{news.length}</span>
      </div>
      <ul className={styles.list}>
        {news.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.ticker}>{item.ticker}</span>
            <span className={styles.title}>{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
