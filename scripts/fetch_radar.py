#!/usr/bin/env python3
"""Daily radar script — fetches quotes, news and generates AI summary via Gemini."""

import yfinance as yf
import feedparser
import json
import os
from datetime import datetime

import requests as http_requests

PORTFOLIO = {
    "ABCB4":  "BCO ABC Brasil",
    "B3SA3":  "B3",
    "BBAS3":  "Banco do Brasil",
    "BBSE3":  "BB Seguridade",
    "BHIA3":  "Casas Bahia",
    "BRKM5":  "Braskem",
    "CSAN3":  "Cosan",
    "CVCB3":  "CVC Brasil",
    "GFSA1":  "Gafisa ON",
    "GFSA3":  "Gafisa",
    "ISAE4":  "ISA Energia",
    "ITUB3":  "Itaú Unibanco",
    "KLBN11": "Klabin",
    "KLBN4":  "Klabin PN",
    "MDIA3":  "M.Dias Branco",
    "PETR4":  "Petrobras",
    "SLCE3":  "SLC Agrícola",
    "VALE3":  "Vale",
    "VIVA3":  "Vivara",
}

MARKET_TICKERS = {
    "ibovespa": "^BVSP",
    "usd_brl":  "USDBRL=X",
}

NEWS_PRIORITY = ["PETR4", "VALE3", "BBAS3", "ITUB3", "BRKM5", "BHIA3", "CSAN3", "SLCE3"]


def fetch_quotes():
    quotes = []
    for ticker, name in PORTFOLIO.items():
        try:
            t = yf.Ticker(f"{ticker}.SA")
            hist = t.history(period="7d", auto_adjust=False)
            if hist.empty:
                continue
            closes = [round(float(v), 2) for v in hist["Close"].tolist()]
            current = closes[-1]
            change_pct = ((closes[-1] - closes[-2]) / closes[-2] * 100) if len(closes) >= 2 else 0.0
            quotes.append({
                "ticker":    ticker,
                "name":      name,
                "price":     current,
                "change_pct": round(change_pct, 2),
                "prices_5d": closes[-5:],
            })
        except Exception as e:
            print(f"  WARN {ticker}: {e}")
    return quotes


def fetch_market():
    market = {}
    for key, sym in MARKET_TICKERS.items():
        try:
            t = yf.Ticker(sym)
            hist = t.history(period="2d")
            if len(hist) >= 2:
                prev, curr = float(hist["Close"].iloc[-2]), float(hist["Close"].iloc[-1])
                market[key] = {
                    "value":      round(curr, 2),
                    "change_pct": round((curr - prev) / prev * 100, 2),
                }
        except Exception as e:
            print(f"  WARN {sym}: {e}")
    return market


def fetch_news():
    news, seen = [], set()
    for ticker in NEWS_PRIORITY:
        url = (
            f"https://news.google.com/rss/search"
            f"?q={ticker}+ações+bolsa&hl=pt-BR&gl=BR&ceid=BR:pt"
        )
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                title = entry.get("title", "").strip()
                if title and title not in seen:
                    seen.add(title)
                    news.append({
                        "ticker":    ticker,
                        "title":     title,
                        "published": entry.get("published", ""),
                    })
        except Exception as e:
            print(f"  WARN news {ticker}: {e}")
    return news[:15]


def generate_summary(quotes, news):
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return "Chave GROQ_API_KEY não configurada."

    pos = [q for q in quotes if q["change_pct"] >= 0]
    neg = [q for q in quotes if q["change_pct"] < 0]

    quotes_txt = "\n".join(
        f"{q['ticker']} ({q['name']}): R$ {q['price']} ({q['change_pct']:+.2f}%)"
        for q in sorted(quotes, key=lambda x: x["change_pct"], reverse=True)
    )
    news_txt = "\n".join(f"[{n['ticker']}] {n['title']}" for n in news[:10])

    prompt = f"""Você é um analista financeiro brasileiro sênior. Analise os dados e gere um radar diário.

CARTEIRA — {len(quotes)} ativos | {len(pos)} em alta | {len(neg)} em queda

COTAÇÕES:
{quotes_txt}

NOTÍCIAS:
{news_txt}

Gere um resumo executivo em português com exatamente estas seções (sem markdown, sem asteriscos):

Visão Geral
[2-3 linhas sobre performance geral da carteira e contexto do dia]

Destaques Positivos
- TICKER +X%: breve comentário (repita para top 3 altas)

Pontos de Atenção
- TICKER -X%: breve comentário (repita para top 3 quedas)

Contexto de Mercado
[2-3 linhas sobre notícias e impacto para a carteira]

Seja direto, objetivo, máximo 300 palavras. Não use asteriscos nem hashtags."""

    # Try Groq models in order — all free tier
    models = ["llama-3.3-70b-versatile", "llama3-8b-8192", "gemma2-9b-it"]
    for model_name in models:
        try:
            print(f"  Tentando modelo: {model_name}")
            resp = http_requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 600,
                    "temperature": 0.7,
                },
                timeout=30,
            )
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            print(f"  OK com {model_name}")
            return text
        except Exception as e:
            print(f"  Falhou {model_name}: {e}")

    return "Resumo indisponível no momento — cotações e notícias acima estão atualizadas."


def main():
    print("=== Radar de Carteira ===")
    print(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")

    print("Buscando cotações...")
    quotes = fetch_quotes()
    print(f"  {len(quotes)} ativos obtidos\n")

    print("Buscando dados de mercado...")
    market = fetch_market()

    print("Buscando notícias...")
    news = fetch_news()
    print(f"  {len(news)} notícias obtidas\n")

    print("Gerando resumo com Gemini...")
    summary = generate_summary(quotes, news)
    print("  OK\n")

    pos = [q for q in quotes if q["change_pct"] >= 0]
    neg = [q for q in quotes if q["change_pct"] < 0]

    radar = {
        "date":            datetime.now().strftime("%d/%m/%Y"),
        "generated_at":    datetime.now().isoformat(),
        "market":          market,
        "quotes":          quotes,
        "news":            news,
        "summary":         summary,
        "positive_count":  len(pos),
        "negative_count":  len(neg),
        "portfolio_count": len(PORTFOLIO),
    }

    out = os.path.join(os.path.dirname(__file__), "..", "public", "radar.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(radar, f, ensure_ascii=False, indent=2)

    print(f"radar.json salvo em {os.path.abspath(out)}")


if __name__ == "__main__":
    main()
