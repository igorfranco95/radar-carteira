import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Header from './components/Header'
import MarketBar from './components/MarketBar'
import SummarySection from './components/SummarySection'
import StockGrid from './components/StockGrid'
import NewsSection from './components/NewsSection'
import { useBrapiQuotes } from './hooks/useBrapiQuotes'

export default function App() {
  const [radar, setRadar]           = useState(null)
  const [radarLoading, setRadarLoading] = useState(true)
  const { quotes: liveQuotes, loading: quotesLoading, lastUpdate, isLive, fetchQuotes } = useBrapiQuotes()

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'radar.json')
      .then(r => r.json())
      .then(data => {
        setRadar(data)
        setRadarLoading(false)
        // Passa sparklines 5d do radar para o hook da Brapi
        const prices5d = {}
        data.quotes?.forEach(q => { prices5d[q.ticker] = q.prices_5d })
        fetchQuotes(prices5d)
      })
      .catch(() => {
        setRadarLoading(false)
        fetchQuotes({})
      })
  }, [])

  const handleRefresh = () => {
    const prices5d = {}
    radar?.quotes?.forEach(q => { prices5d[q.ticker] = q.prices_5d })
    fetchQuotes(prices5d)
  }

  // Brapi ao vivo tem prioridade; fallback para snapshot do radar
  const displayQuotes = liveQuotes.length > 0 ? liveQuotes : (radar?.quotes || [])
  const positiveCount = displayQuotes.filter(q => q.change_pct >= 0).length
  const negativeCount = displayQuotes.filter(q => q.change_pct < 0).length

  const updatedAt = lastUpdate
    ? lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : radar?.generated_at
      ? new Date(radar.generated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '--:--'

  if (radarLoading && quotesLoading) return (
    <div className={styles.centered}>
      <div className={styles.spinner} />
      <span className={styles.loadingText}>CARREGANDO RADAR...</span>
    </div>
  )

  return (
    <div className={styles.app}>
      <Header
        date={radar?.date || new Date().toLocaleDateString('pt-BR')}
        positiveCount={positiveCount}
        negativeCount={negativeCount}
        updatedAt={updatedAt}
        isLive={isLive}
        onRefresh={handleRefresh}
      />
      <MarketBar market={radar?.market} />
      <main className={styles.main}>
        {radar?.summary && <SummarySection summary={radar.summary} />}
        <StockGrid quotes={displayQuotes} quotesLoading={quotesLoading} />
        {radar?.news && <NewsSection news={radar.news} />}
      </main>
      <footer className={styles.footer}>
        {isLive ? '● AO VIVO' : '○ SNAPSHOT 08:30'} · {updatedAt} · {radar?.date || ''}
      </footer>
    </div>
  )
}
