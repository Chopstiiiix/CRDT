import { subMonths, format } from 'date-fns'

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2))

export function generateMockData(proId) {
  const seed = proId.charCodeAt(0)
  const multiplier = (seed % 5) + 1

  // Monthly earnings — last 12 months
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(new Date(), 11 - i)
    return {
      month: format(d, 'MMM yy'),
      performance: rand(200, 900) * multiplier,
      mechanical: rand(80, 400) * multiplier,
      sync: rand(0, 300) * multiplier,
      digital: rand(150, 600) * multiplier,
    }
  })

  // Catalogue
  const titles = [
    'Midnight Signal', 'Golden Frame', 'Echo Chamber', 'Soft Current',
    'Pale Frequency', 'Open Hours', 'Glass Theory', 'North Light',
    'Paper Wolves', 'Salt & Circuit', 'Low Tide Morning', 'Afterglow Protocol'
  ]
  const catalogue = titles.slice(0, rand(4, 10)).map((title, i) => ({
    id: `${proId}-${i}`,
    title,
    iswc: `T-${rand(100000000, 999999999)}.0`,
    registered: format(subMonths(new Date(), rand(1, 48)), 'MMM d, yyyy'),
    writers: rand(1, 3),
    totalEarned: rand(300, 12000) * multiplier,
    lastPayment: rand(10, 1200) * multiplier,
    status: ['active', 'active', 'active', 'pending', 'inactive'][rand(0, 4)],
    usageType: ['Performance', 'Mechanical', 'Sync', 'Digital'][rand(0, 3)],
  }))

  // Statements
  const statements = Array.from({ length: rand(3, 7) }, (_, i) => {
    const d = subMonths(new Date(), (i + 1) * 3)
    const total = rand(400, 8000) * multiplier
    return {
      id: `stmt-${proId}-${i}`,
      period: `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`,
      issued: format(d, 'MMM d, yyyy'),
      total,
      status: i === 0 ? 'processing' : 'paid',
      breakdown: {
        performance: rand(30, 60),
        mechanical: rand(10, 30),
        sync: rand(5, 20),
        digital: rand(10, 40),
      }
    }
  })

  const totalEarnings = monthly.reduce(
    (acc, m) => acc + m.performance + m.mechanical + m.sync + m.digital, 0
  )

  return {
    totalEarnings,
    pendingBalance: rand(200, 4000) * multiplier,
    catalogueCount: catalogue.length,
    monthly,
    catalogue,
    statements,
    topCountries: [
      { name: 'United States', pct: rand(25, 55) },
      { name: 'United Kingdom', pct: rand(10, 25) },
      { name: 'Germany', pct: rand(5, 15) },
      { name: 'Canada', pct: rand(3, 12) },
      { name: 'Australia', pct: rand(2, 8) },
    ].sort((a, b) => b.pct - a.pct),
  }
}
