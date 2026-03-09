import { createContext, useContext, useState, useCallback } from 'react'
import { API_URL } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)

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

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
