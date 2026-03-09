import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // simulate network
    const ok = login(email, password)
    if (ok) {
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Password must be 6+ characters.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px 12px 40px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 20,
    }}>
      {/* Mesh background */}
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1, animation: 'scaleIn 0.4s ease forwards' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52,
            background: 'linear-gradient(135deg, rgba(74,158,255,0.3), rgba(45,212,191,0.2))',
            border: '1px solid rgba(74,158,255,0.3)',
            borderRadius: 16,
            backdropFilter: 'blur(20px)',
            marginBottom: 16,
          }}>
            <Music2 size={22} color="#4a9eff" />
          </div>
          <h1 className="font-display" style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>
            RoyalTrack
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
            All your PRO accounts, one place.
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong" style={{ borderRadius: 22, padding: '28px 28px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 22 }}>Sign in</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(74,158,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(74,158,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10,
                fontSize: 13,
                color: '#f87171',
              }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: '13px',
                background: loading
                  ? 'rgba(74,158,255,0.15)'
                  : 'linear-gradient(135deg, rgba(74,158,255,0.5), rgba(45,212,191,0.3))',
                border: '1px solid rgba(74,158,255,0.4)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : (
                <>Continue <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Don't have an account?{' '}
            <span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>Sign up</span>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 18 }}>
          Demo: use any email + 6+ char password
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes scaleIn { from { opacity:0; transform: scale(0.97) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  )
}
