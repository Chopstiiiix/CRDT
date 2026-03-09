import { createClient } from '@supabase/supabase-js'

// Service-role client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Creates a client scoped to a user's JWT (respects RLS)
export function supabaseForUser(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  )
}
