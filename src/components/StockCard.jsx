import Sparkline from './Sparkline'
import styles from './StockCard.module.css'

export default function StockCard({ ticker, name, price, change_pct, prices_5d }) {
  const pos = change_pct >= 0
  const sign = pos ? '+' : ''

  return (
    <div className={`${styles.card} ${pos ? styles.pos : styles.neg}`}>
      <div className={styles.top}>
        <div className={styles.left}>
          <span className={styles.ticker}>{ticker}</span>
          <span className={styles.name}>{name}</span>
        </div>
        <div className={styles.right}>
          <span className={`${styles.change} ${pos ? styles.changePos : styles.changeNeg}`}>
            {pos ? '▲' : '▼'} {sign}{Math.abs(change_pct).toFixed(2)}%
          </span>
          <span className={styles.price}>
            R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <div className={styles.chart}>
        <Sparkline data={prices_5d} positive={pos} width={220} height={52} />
        <div className={styles.chartLabels}>
          <span>5D</span>
          <span>{prices_5d ? `min ${Math.min(...prices_5d).toFixed(2)}` : ''}</span>
          <span>{prices_5d ? `max ${Math.max(...prices_5d).toFixed(2)}` : ''}</span>
        </div>
      </div>
    </div>
  )
}
