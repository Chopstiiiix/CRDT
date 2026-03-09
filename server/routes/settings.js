import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/settings
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('name, email, avatar_url, currency, notif_payments, notif_statements, notif_news')
    .eq('id', req.user.id)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PUT /api/settings
router.put('/', async (req, res) => {
  const allowed = ['name', 'currency', 'notif_payments', 'notif_statements', 'notif_news']
  const updates = {}
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' })
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
