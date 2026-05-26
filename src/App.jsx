import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Header from './components/Header'
import MarketBar from './components/MarketBar'
import SummarySection from './components/SummarySection'
import StockGrid from './components/StockGrid'
import NewsSection from './components/NewsSection'

export default function App() {
  const [radar, setRadar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'radar.json')
      .then(r => {
        if (!r.ok) throw new Error('Dados não encontrados')
        return r.json()
      })
      .then(data => { setRadar(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className={styles.centered}>
      <div className={styles.spinner} />
      <span className={styles.loadingText}>CARREGANDO RADAR...</span>
    </div>
  )

  if (error) return (
    <div className={styles.centered}>
      <span className={styles.errorIcon}>⚠</span>
      <span className={styles.errorText}>{error}</span>
      <span className={styles.errorSub}>Execute o script de radar para gerar os dados</span>
    </div>
  )

  const updatedAt = new Date(radar.generated_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className={styles.app}>
      <Header
        date={radar.date}
        positiveCount={radar.positive_count}
        negativeCount={radar.negative_count}
        updatedAt={updatedAt}
      />
      <MarketBar market={radar.market} />
      <main className={styles.main}>
        <SummarySection summary={radar.summary} />
        <StockGrid quotes={radar.quotes} />
        <NewsSection news={radar.news} />
      </main>
      <footer className={styles.footer}>
        RADAR · ATUALIZADO ÀS {updatedAt} · {radar.date}
      </footer>
    </div>
  )
}
