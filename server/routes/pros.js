import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { encrypt, decrypt } from '../config/encryption.js'
import { PRO_REGISTRY } from '../utils/proRegistry.js'
import { syncPROData } from '../services/proSync.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// ── Helper: assemble full PRO data from DB ───────────────────────────

async function assembleProData(connection) {
  const cid = connection.id
  const registry = PRO_REGISTRY[connection.pro_id]

  const [monthly, catalogue, statements, countries] = await Promise.all([
    supabaseAdmin.from('royalty_monthly').select('*').eq('connection_id', cid).order('id'),
    supabaseAdmin.from('catalogue_works').select('*').eq('connection_id', cid),
    supabaseAdmin.from('statements').select('*').eq('connection_id', cid).order('id'),
    supabaseAdmin.from('top_countries').select('*').eq('connection_id', cid).order('pct', { ascending: false }),
  ])

  const monthlyData = (monthly.data || []).map(r => ({
    month: r.month,
    performance: r.performance,
    mechanical: r.mechanical,
    sync: r.sync,
    digital: r.digital,
  }))

  const totalEarnings = monthlyData.reduce(
    (acc, m) => acc + m.performance + m.mechanical + m.sync + m.digital, 0
  )

  const catalogueData = (catalogue.data || []).map(r => ({
    id: r.id,
    title: r.title,
    iswc: r.iswc,
    registered: r.registered,
    writers: r.writers,
    totalEarned: r.total_earned,
    lastPayment: r.last_payment,
    status: r.status,
    usageType: r.usage_type,
  }))

  const statementsData = (statements.data || []).map(r => ({
    id: r.id,
    period: r.period,
    issued: r.issued,
    total: r.total,
    status: r.status,
    breakdown: {
      performance: r.breakdown_performance,
      mechanical: r.breakdown_mechanical,
      sync: r.breakdown_sync,
      digital: r.breakdown_digital,
    },
  }))

  const countriesData = (countries.data || []).map(r => ({
    name: r.country_name,
    pct: r.pct,
  }))

  // Decrypt accountId
  let accountId = ''
  try {
    accountId = decrypt(
      connection.account_id_enc,
      connection.account_id_iv,
      connection.account_id_tag,
    )
  } catch { /* leave blank if decryption fails */ }

  return {
    ...registry,
    colorClass: `pro-${connection.pro_id}`,
    accountId,
    lastSynced: connection.last_synced_at,
    data: {
      totalEarnings,
      pendingBalance: Math.floor(totalEarnings * 0.08), // approximate
      catalogueCount: catalogueData.length,
      monthly: monthlyData,
      catalogue: catalogueData,
      statements: statementsData,
      topCountries: countriesData,
    },
  }
}

// ── GET /api/pros ────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const { data: connections, error } = await supabaseAdmin
    .from('pro_connections')
    .select('*')
    .eq('user_id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })

  const results = await Promise.all(connections.map(assembleProData))
  res.json(results)
})

// ── GET /api/pros/:proId ─────────────────────────────────────────────

router.get('/:proId', async (req, res) => {
  const { data: connection, error } = await supabaseAdmin
    .from('pro_connections')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('pro_id', req.params.proId)
    .single()

  if (error || !connection) {
    return res.status(404).json({ error: 'PRO not connected' })
  }

  const result = await assembleProData(connection)
  res.json(result)
})

// ── POST /api/pros ───────────────────────────────────────────────────

router.post('/', async (req, res) => {
  const { proId, accountId } = req.body

  if (!proId || !accountId) {
    return res.status(400).json({ error: 'proId and accountId are required' })
  }
  if (!PRO_REGISTRY[proId]) {
    return res.status(400).json({ error: 'Unsupported PRO' })
  }

  // Check for duplicate
  const { data: existing } = await supabaseAdmin
    .from('pro_connections')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('pro_id', proId)
    .single()

  if (existing) {
    return res.status(409).json({ error: 'PRO already connected' })
  }

  // Encrypt the account ID
  const { encrypted, iv, authTag } = encrypt(accountId)

  const { data: connection, error } = await supabaseAdmin
    .from('pro_connections')
    .insert({
      user_id: req.user.id,
      pro_id: proId,
      account_id_enc: encrypted,
      account_id_iv: iv,
      account_id_tag: authTag,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Trigger initial data sync
  await syncPROData(connection.id, proId)

  const result = await assembleProData(connection)
  res.status(201).json(result)
})

// ── DELETE /api/pros/:proId ──────────────────────────────────────────

router.delete('/:proId', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('pro_connections')
    .delete()
    .eq('user_id', req.user.id)
    .eq('pro_id', req.params.proId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

export default router
