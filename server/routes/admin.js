import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = Router()

// All routes require admin
router.use(requireAdmin)

// GET /api/admin/stats — platform-wide statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalConnections },
      { count: totalWorks },
      { count: totalLicenses },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('pro_connections').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('catalogue_works').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('sync_licenses').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
    ])

    // Total royalty revenue
    const { data: royalties } = await supabaseAdmin
      .from('royalty_monthly')
      .select('performance, mechanical, sync, digital')

    const totalRevenue = (royalties || []).reduce((sum, r) =>
      sum + (r.performance || 0) + (r.mechanical || 0) + (r.sync || 0) + (r.digital || 0), 0)

    // Sync license revenue
    const { data: syncData } = await supabaseAdmin
      .from('sync_licenses')
      .select('fee')

    const totalSyncRevenue = (syncData || []).reduce((sum, l) => sum + (parseFloat(l.fee) || 0), 0)

    // PRO distribution
    const { data: proConns } = await supabaseAdmin
      .from('pro_connections')
      .select('pro_id')

    const proDistribution = {}
    ;(proConns || []).forEach(c => {
      proDistribution[c.pro_id] = (proDistribution[c.pro_id] || 0) + 1
    })

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
    const { count: recentSignups } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo)

    res.json({
      totalUsers,
      totalConnections,
      totalWorks,
      totalLicenses,
      totalRevenue,
      totalSyncRevenue,
      proDistribution,
      recentSignups: recentSignups || 0,
    })
  } catch (err) {
    console.error('[admin] Stats error:', err.message)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/admin/users — list all users with their data
router.get('/users', async (req, res) => {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, role, suspended, suspended_reason, suspended_at, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get connection counts per user
    const { data: connections } = await supabaseAdmin
      .from('pro_connections')
      .select('user_id, pro_id')

    const connMap = {}
    ;(connections || []).forEach(c => {
      if (!connMap[c.user_id]) connMap[c.user_id] = []
      connMap[c.user_id].push(c.pro_id)
    })

    const users = profiles.map(p => ({
      ...p,
      proCount: connMap[p.id]?.length || 0,
      pros: connMap[p.id] || [],
    }))

    res.json(users)
  } catch (err) {
    console.error('[admin] Users error:', err.message)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// POST /api/admin/users/:userId/suspend — suspend a user
router.post('/users/:userId/suspend', async (req, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body || {}

    // Don't allow suspending yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot suspend your own account' })
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        suspended: true,
        suspended_reason: reason || 'Flagged for suspicious activity',
        suspended_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error

    res.json({ ok: true })
  } catch (err) {
    console.error('[admin] Suspend error:', err.message)
    res.status(500).json({ error: 'Failed to suspend user' })
  }
})

// POST /api/admin/users/:userId/unsuspend — reactivate a user
router.post('/users/:userId/unsuspend', async (req, res) => {
  try {
    const { userId } = req.params

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        suspended: false,
        suspended_reason: null,
        suspended_at: null,
      })
      .eq('id', userId)

    if (error) throw error

    res.json({ ok: true })
  } catch (err) {
    console.error('[admin] Unsuspend error:', err.message)
    res.status(500).json({ error: 'Failed to unsuspend user' })
  }
})

// GET /api/admin/users/:userId — single user detail
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) return res.status(404).json({ error: 'User not found' })

    // Get their connections
    const { data: connections } = await supabaseAdmin
      .from('pro_connections')
      .select('id, pro_id, last_synced_at, created_at')
      .eq('user_id', userId)

    // Get their sync licenses count
    const connIds = (connections || []).map(c => c.id)
    let licenseCount = 0
    if (connIds.length > 0) {
      const { count } = await supabaseAdmin
        .from('sync_licenses')
        .select('*', { count: 'exact', head: true })
        .in('connection_id', connIds)
      licenseCount = count || 0
    }

    res.json({
      ...profile,
      connections: connections || [],
      licenseCount,
    })
  } catch (err) {
    console.error('[admin] User detail error:', err.message)
    res.status(500).json({ error: 'Failed to fetch user details' })
  }
})

export default router
