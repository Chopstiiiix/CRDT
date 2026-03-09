import { useState, useEffect, useCallback } from 'react'

// Static rates (fetched from backend, fallback to USD)
const FALLBACK_RATES = {
  USD: 1, GBP: 0.79, EUR: 0.92, CAD: 1.36, AUD: 1.53,
  JPY: 149.5, CHF: 0.88, SEK: 10.45, NOK: 10.65, DKK: 6.87,
}

const SYMBOLS = {
  USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$',
  JPY: '¥', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
}

export function useCurrency() {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('rt_currency') || 'USD'
  })
  const [rates, setRates] = useState(FALLBACK_RATES)

  useEffect(() => {
    fetch('/api/currency/rates')
      .then(r => r.json())
      .then(data => { if (data.rates) setRates(data.rates) })
      .catch(() => {})
  }, [])

  const changeCurrency = useCallback((c) => {
    setCurrency(c)
    localStorage.setItem('rt_currency', c)
  }, [])

  const convert = useCallback((amount, from = 'USD') => {
    if (from === currency) return amount
    const inUsd = amount / (rates[from] || 1)
    return inUsd * (rates[currency] || 1)
  }, [currency, rates])

  const fmt = useCallback((amount, from = 'USD') => {
    const converted = convert(amount, from)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(converted)
  }, [convert, currency])

  return {
    currency,
    setCurrency: changeCurrency,
    convert,
    fmt,
    rates,
    currencies: Object.keys(rates),
    symbol: SYMBOLS[currency] || currency,
  }
}
