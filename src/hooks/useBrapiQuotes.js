import { useState, useCallback } from 'react'
import { PORTFOLIO, TICKERS } from '../data/portfolio'

const BRAPI_BASE = 'https://brapi.dev/api'
const TOKEN = import.meta.env.VITE_BRAPI_TOKEN
const tokenParam = TOKEN ? `&token=${TOKEN}` : ''

export function useBrapiQuotes() {
  const [quotes, setQuotes]       = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isLive, setIsLive]       = useState(false)

  const fetchQuotes = useCallback(async (prices5d = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${BRAPI_BASE}/quote/${TICKERS.join(',')}?fundamental=false${tokenParam}`
      )
      if (!res.ok) throw new Error(`Brapi retornou ${res.status}`)
      const data = await res.json()

      if (!data.results?.length) throw new Error('Sem dados da Brapi')

      const mapped = data.results.map(s => {
        const ticker = s.symbol.replace('.SA', '')
        return {
          ticker,
          name:       PORTFOLIO[ticker] || s.shortName || ticker,
          price:      s.regularMarketPrice,
          change_pct: s.regularMarketChangePercent,
          prices_5d:  prices5d[ticker] || [],
        }
      })

      setQuotes(mapped)
      setLastUpdate(new Date())
      setIsLive(true)
    } catch (e) {
      console.warn('Brapi falhou, usando dados do radar:', e.message)
      setError(e.message)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  return { quotes, loading, error, lastUpdate, isLive, fetchQuotes }
}
