import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) {
    return res.status(400).json({ error: authErr.message })
  }

  // Create profile row
  const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    email,
    name: name || email.split('@')[0],
  })

  if (profileErr) {
    console.error('[auth] Profile creation failed:', profileErr.message)
  }

  // Sign in to get a session
  const { data: session, error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })

  if (signInErr) {
    return res.status(400).json({ error: signInErr.message })
  }

  res.json({
    user: { id: authData.user.id, email, name: name || email.split('@')[0] },
    session: session.session,
  })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return res.status(401).json({ error: error.message })
  }

  // Fetch profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, avatar_url, role, suspended, suspended_reason')
    .eq('id', data.user.id)
    .single()

  // Check if account is suspended
  if (profile?.suspended) {
    return res.status(403).json({
      error: 'Account suspended',
      reason: profile.suspended_reason || 'Your account has been temporarily disabled.',
    })
  }

  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || email.split('@')[0],
      avatar: profile?.avatar_url,
      role: profile?.role || 'user',
    },
    session: data.session,
  })
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  // Frontend clears its session state; server-side we can optionally
  // sign out the user's sessions via a scoped client
  const token = req.headers.authorization?.slice(7)
  if (token) {
    const { createClient } = await import('@supabase/supabase-js')
    const scopedClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    await scopedClient.auth.signOut().catch(() => {})
  }
  res.json({ ok: true })
})

export default router
