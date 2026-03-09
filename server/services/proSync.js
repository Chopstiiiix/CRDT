import { supabaseAdmin } from '../config/supabase.js'

// ── Mock data generation (mirrors src/data/mockData.js) ──────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function monthLabel(monthsAgo) {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function dateLabel(monthsAgo) {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function generateMockData(proId) {
  const seed = proId.charCodeAt(0)
  const multiplier = (seed % 5) + 1

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: monthLabel(11 - i),
    performance: rand(200, 900) * multiplier,
    mechanical: rand(80, 400) * multiplier,
    sync: rand(0, 300) * multiplier,
    digital: rand(150, 600) * multiplier,
  }))

  const titles = [
    'Midnight Signal', 'Golden Frame', 'Echo Chamber', 'Soft Current',
    'Pale Frequency', 'Open Hours', 'Glass Theory', 'North Light',
    'Paper Wolves', 'Salt & Circuit', 'Low Tide Morning', 'Afterglow Protocol',
  ]

  const catalogue = titles.slice(0, rand(4, 10)).map((title, i) => ({
    title,
    iswc: `T-${rand(100000000, 999999999)}.0`,
    registered: dateLabel(rand(1, 48)),
    writers: rand(1, 3),
    total_earned: rand(300, 12000) * multiplier,
    last_payment: rand(10, 1200) * multiplier,
    status: ['active', 'active', 'active', 'pending', 'inactive'][rand(0, 4)],
    usage_type: ['Performance', 'Mechanical', 'Sync', 'Digital'][rand(0, 3)],
  }))

  const statements = Array.from({ length: rand(3, 7) }, (_, i) => {
    const monthsAgo = (i + 1) * 3
    const d = new Date()
    d.setMonth(d.getMonth() - monthsAgo)
    const total = rand(400, 8000) * multiplier
    return {
      period: `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`,
      issued: dateLabel(monthsAgo),
      total,
      status: i === 0 ? 'processing' : 'paid',
      breakdown_performance: rand(30, 60),
      breakdown_mechanical: rand(10, 30),
      breakdown_sync: rand(5, 20),
      breakdown_digital: rand(10, 40),
    }
  })

  const topCountries = [
    { country_name: 'United States', pct: rand(25, 55) },
    { country_name: 'United Kingdom', pct: rand(10, 25) },
    { country_name: 'Germany', pct: rand(5, 15) },
    { country_name: 'Canada', pct: rand(3, 12) },
    { country_name: 'Australia', pct: rand(2, 8) },
  ].sort((a, b) => b.pct - a.pct)

  return { monthly, catalogue, statements, topCountries }
}

// ── Sync: generate + upsert into Supabase ────────────────────────────

export async function syncPROData(connectionId, proId) {
  const data = generateMockData(proId)

  // Clear old data for this connection
  await Promise.all([
    supabaseAdmin.from('royalty_monthly').delete().eq('connection_id', connectionId),
    supabaseAdmin.from('catalogue_works').delete().eq('connection_id', connectionId),
    supabaseAdmin.from('statements').delete().eq('connection_id', connectionId),
    supabaseAdmin.from('top_countries').delete().eq('connection_id', connectionId),
  ])

  // Insert fresh data
  await Promise.all([
    supabaseAdmin.from('royalty_monthly').insert(
      data.monthly.map(m => ({ connection_id: connectionId, ...m }))
    ),
    supabaseAdmin.from('catalogue_works').insert(
      data.catalogue.map(c => ({ connection_id: connectionId, ...c }))
    ),
    supabaseAdmin.from('statements').insert(
      data.statements.map(s => ({ connection_id: connectionId, ...s }))
    ),
    supabaseAdmin.from('top_countries').insert(
      data.topCountries.map(tc => ({ connection_id: connectionId, ...tc }))
    ),
  ])

  // Update last_synced_at
  await supabaseAdmin
    .from('pro_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', connectionId)
}

export async function syncAllConnections() {
  const { data: connections, error } = await supabaseAdmin
    .from('pro_connections')
    .select('id, pro_id')

  if (error) {
    console.error('[sync] Failed to fetch connections:', error.message)
    return
  }

  console.log(`[sync] Refreshing ${connections.length} PRO connections…`)

  for (const conn of connections) {
    try {
      await syncPROData(conn.id, conn.pro_id)
    } catch (err) {
      console.error(`[sync] Error syncing ${conn.pro_id}:`, err.message)
    }
  }

  console.log('[sync] Done.')
}
