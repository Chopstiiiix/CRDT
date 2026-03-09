import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/sync-licenses
router.get('/', async (req, res) => {
  // Get all licenses for user's connected PROs
  const { data: connections } = await supabaseAdmin
    .from('pro_connections')
    .select('id, pro_id')
    .eq('user_id', req.user.id)

  if (!connections?.length) return res.json([])

  const connIds = connections.map(c => c.id)
  const { data: licenses, error } = await supabaseAdmin
    .from('sync_licenses')
    .select('*')
    .in('connection_id', connIds)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  // Attach pro_id for frontend
  const connMap = Object.fromEntries(connections.map(c => [c.id, c.pro_id]))
  const result = (licenses || []).map(l => ({
    ...l,
    proId: connMap[l.connection_id],
  }))

  res.json(result)
})

// POST /api/sync-licenses
router.post('/', async (req, res) => {
  const { proId, workTitle, licensee, projectType, territory, fee, currency, startDate, endDate, status, notes } = req.body

  if (!proId || !workTitle || !licensee) {
    return res.status(400).json({ error: 'proId, workTitle, and licensee are required' })
  }

  const { data: conn } = await supabaseAdmin
    .from('pro_connections')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('pro_id', proId)
    .single()

  if (!conn) return res.status(404).json({ error: 'PRO not connected' })

  const { data: license, error } = await supabaseAdmin
    .from('sync_licenses')
    .insert({
      connection_id: conn.id,
      work_title: workTitle,
      licensee,
      project_type: projectType || 'Other',
      territory: territory || 'Worldwide',
      fee: fee || 0,
      currency: currency || 'USD',
      start_date: startDate || null,
      end_date: endDate || null,
      status: status || 'pending',
      notes: notes || null,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.status(201).json({ ...license, proId })
})

// PUT /api/sync-licenses/:id
router.put('/:id', async (req, res) => {
  const allowed = ['work_title', 'licensee', 'project_type', 'territory', 'fee', 'currency', 'start_date', 'end_date', 'status', 'notes']
  const updates = {}
  for (const key of allowed) {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    if (req.body[camel] !== undefined) updates[key] = req.body[camel]
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  }

  const { data, error } = await supabaseAdmin
    .from('sync_licenses')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/sync-licenses/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('sync_licenses')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

export default router
