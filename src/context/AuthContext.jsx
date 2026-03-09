import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rt_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (email, password) => {
    // Mock auth — replace with real API
    if (email && password.length >= 6) {
      const u = { id: '1', email, name: email.split('@')[0], avatar: null }
      setUser(u)
      localStorage.setItem('rt_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('rt_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
