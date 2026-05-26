import styles from './MarketBar.module.css'

function Tick({ label, value, changePct, prefix = '' }) {
  const pos = changePct >= 0
  return (
    <div className={styles.tick}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : value}</span>
      <span className={pos ? styles.pos : styles.neg}>
        {pos ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
      </span>
    </div>
  )
}

export default function MarketBar({ market }) {
  if (!market) return null
  return (
    <div className={styles.bar}>
      <Tick label="IBOV" value={market.ibovespa?.value} changePct={market.ibovespa?.change_pct} />
      <div className={styles.sep} />
      <Tick label="USD/BRL" value={market.usd_brl?.value} changePct={market.usd_brl?.change_pct} prefix="R$ " />
    </div>
  )
}
