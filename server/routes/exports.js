import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { PRO_REGISTRY } from '../utils/proRegistry.js'

const router = Router()
router.use(requireAuth)

// GET /api/exports/csv/:proId
router.get('/csv/:proId', async (req, res) => {
  const { proId } = req.params
  const pro = PRO_REGISTRY[proId]
  if (!pro) return res.status(400).json({ error: 'Invalid PRO' })

  const { data: conn } = await supabaseAdmin
    .from('pro_connections')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('pro_id', proId)
    .single()

  if (!conn) return res.status(404).json({ error: 'PRO not connected' })

  const { type = 'statements' } = req.query

  if (type === 'statements') {
    const { data: rows } = await supabaseAdmin
      .from('statements')
      .select('*')
      .eq('connection_id', conn.id)
      .order('id')

    const header = 'Period,Issued,Total,Status,Performance %,Mechanical %,Sync %,Digital %\n'
    const csv = header + (rows || []).map(r =>
      `"${r.period}","${r.issued}",${r.total},${r.status},${r.breakdown_performance},${r.breakdown_mechanical},${r.breakdown_sync},${r.breakdown_digital}`
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${pro.name}-statements.csv"`)
    res.send(csv)

  } else if (type === 'catalogue') {
    const { data: rows } = await supabaseAdmin
      .from('catalogue_works')
      .select('*')
      .eq('connection_id', conn.id)

    const header = 'Title,ISWC,Registered,Writers,Total Earned,Last Payment,Status,Usage Type\n'
    const csv = header + (rows || []).map(r =>
      `"${r.title}","${r.iswc}","${r.registered}",${r.writers},${r.total_earned},${r.last_payment},${r.status},"${r.usage_type}"`
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${pro.name}-catalogue.csv"`)
    res.send(csv)

  } else if (type === 'monthly') {
    const { data: rows } = await supabaseAdmin
      .from('royalty_monthly')
      .select('*')
      .eq('connection_id', conn.id)
      .order('id')

    const header = 'Month,Performance,Mechanical,Sync,Digital,Total\n'
    const csv = header + (rows || []).map(r =>
      `"${r.month}",${r.performance},${r.mechanical},${r.sync},${r.digital},${r.performance + r.mechanical + r.sync + r.digital}`
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${pro.name}-monthly.csv"`)
    res.send(csv)
  } else {
    res.status(400).json({ error: 'Invalid export type. Use: statements, catalogue, or monthly' })
  }
})

export default router
