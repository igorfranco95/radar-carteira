import StockCard from './StockCard'
import styles from './StockGrid.module.css'

export default function StockGrid({ quotes, quotesLoading }) {
  const sorted = [...quotes].sort((a, b) => b.change_pct - a.change_pct)

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>COTAÇÕES</span>
        <span className={styles.count}>
          {quotesLoading ? 'ATUALIZANDO...' : `${quotes.length} ATIVOS`}
        </span>
      </div>
      <div className={styles.grid}>
        {sorted.map(q => (
          <StockCard key={q.ticker} {...q} />
        ))}
      </div>
    </section>
  )
}
