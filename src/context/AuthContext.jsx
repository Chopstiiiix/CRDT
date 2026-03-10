import { createContext, useContext, useState, useCallback } from 'react'
import { API_URL } from '../config'

const AuthContext = createContext(null)

function saveAuth(user, session) {
  try {
    localStorage.setItem('rt_user', JSON.stringify(user))
    localStorage.setItem('rt_session', JSON.stringify(session))
  } catch {}
}

function loadAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('rt_user'))
    const session = JSON.parse(localStorage.getItem('rt_session'))
    if (user && session?.access_token) return { user, session }
  } catch {}
  return { user: null, session: null }
}

function clearAuth() {
  localStorage.removeItem('rt_user')
  localStorage.removeItem('rt_session')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadAuth().user)
  const [session, setSession] = useState(() => loadAuth().session)

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error }

      setUser(data.user)
      setSession(data.session)
      saveAuth(data.user, data.session)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }, [])

  const signup = useCallback(async (email, password, name) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error }

      setUser(data.user)
      setSession(data.session)
      saveAuth(data.user, data.session)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }, [])

  const logout = useCallback(async () => {
    if (session?.access_token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {})
    }
    setUser(null)
    setSession(null)
    clearAuth()
  }, [session])

  // Helper for authenticated fetch calls
  const authFetch = useCallback(async (url, opts = {}) => {
    if (!session?.access_token) throw new Error('Not authenticated')
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`
    return fetch(fullUrl, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...opts.headers,
      },
    })
  }, [session])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, authFetch, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
