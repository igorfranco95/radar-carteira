import styles from './SummarySection.module.css'

export default function SummarySection({ summary }) {
  const lines = summary
    .split('\n')
    .map(l => l.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim())
    .filter(Boolean)

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>ANÁLISE DO DIA</span>
        <span className={styles.badge}>GEMINI AI</span>
      </div>
      <div className={styles.content}>
        {lines.map((line, i) => {
          // Lines starting with number+dot or bullet are list items
          const isItem = /^[\d]+\.|^[-•]/.test(line)
          return (
            <p key={i} className={isItem ? styles.item : styles.para}>
              {line}
            </p>
          )
        })}
      </div>
    </section>
  )
}
