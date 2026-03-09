import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const PROContext = createContext(null)

export const PRO_REGISTRY = {
  bmi: {
    id: 'bmi', name: 'BMI', fullName: 'Broadcast Music Inc.',
    colorClass: 'pro-bmi', color: '#4a9eff',
    country: 'USA', website: 'bmi.com',
  },
  ascap: {
    id: 'ascap', name: 'ASCAP', fullName: 'American Society of Composers, Authors & Publishers',
    colorClass: 'pro-ascap', color: '#f87171',
    country: 'USA', website: 'ascap.com',
  },
  prs: {
    id: 'prs', name: 'PRS', fullName: 'PRS for Music',
    colorClass: 'pro-prs', color: '#2dd4bf',
    country: 'UK', website: 'prsformusic.com',
  },
  songtrust: {
    id: 'songtrust', name: 'Songtrust', fullName: 'Songtrust',
    colorClass: 'pro-songtrust', color: '#a78bfa',
    country: 'Global', website: 'songtrust.com',
  },
  sesac: {
    id: 'sesac', name: 'SESAC', fullName: 'SESAC',
    colorClass: 'pro-sesac', color: '#fbbf24',
    country: 'USA', website: 'sesac.com',
  },
  socan: {
    id: 'socan', name: 'SOCAN', fullName: 'Society of Composers, Authors & Music Publishers of Canada',
    colorClass: 'pro-socan', color: '#34d399',
    country: 'Canada', website: 'socan.com',
  },
}

export function PROProvider({ children }) {
  const { authFetch, user } = useAuth()
  const [connectedPROs, setConnectedPROs] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch connected PROs from backend when user logs in
  const fetchPROs = useCallback(async () => {
    if (!user) {
      setConnectedPROs([])
      return
    }
    setLoading(true)
    try {
      const res = await authFetch('/api/pros')
      if (res.ok) {
        const data = await res.json()
        setConnectedPROs(data)
      }
    } catch (err) {
      console.error('Failed to fetch PROs:', err)
    } finally {
      setLoading(false)
    }
  }, [user, authFetch])

  useEffect(() => {
    fetchPROs()
  }, [fetchPROs])

  const addPRO = useCallback(async (proId, accountId) => {
    try {
      const res = await authFetch('/api/pros', {
        method: 'POST',
        body: JSON.stringify({ proId, accountId }),
      })
      if (res.ok) {
        const newPro = await res.json()
        setConnectedPROs(prev => [...prev, newPro])
        return { ok: true }
      }
      const err = await res.json()
      return { ok: false, error: err.error }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }, [authFetch])

  const removePRO = useCallback(async (proId) => {
    try {
      const res = await authFetch(`/api/pros/${proId}`, { method: 'DELETE' })
      if (res.ok) {
        setConnectedPROs(prev => prev.filter(p => p.id !== proId))
      }
    } catch (err) {
      console.error('Failed to remove PRO:', err)
    }
  }, [authFetch])

  const getPRO = useCallback(
    (proId) => connectedPROs.find(p => p.id === proId),
    [connectedPROs]
  )

  return (
    <PROContext.Provider value={{ connectedPROs, addPRO, removePRO, getPRO, PRO_REGISTRY, loading }}>
      {children}
    </PROContext.Provider>
  )
}

export const usePRO = () => useContext(PROContext)
