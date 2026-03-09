// Static exchange rates (updated periodically; for production use a live API)
const RATES = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CHF: 0.88,
  SEK: 10.45,
  NOK: 10.65,
  DKK: 6.87,
}

export function convert(amount, from, to) {
  if (from === to) return amount
  const inUsd = amount / (RATES[from] || 1)
  return inUsd * (RATES[to] || 1)
}

export function getSupportedCurrencies() {
  return Object.keys(RATES)
}

export { RATES }
