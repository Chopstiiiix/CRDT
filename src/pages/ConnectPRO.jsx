import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, Plus, ExternalLink } from 'lucide-react'
import { usePRO } from '../context/PROContext'
import { GlassCard, GlassButton } from '../components/UI'

export default function ConnectPRO() {
  const { connectedPROs, addPRO, PRO_REGISTRY } = usePRO()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [accountId, setAccountId] = useState('')
  const [success, setSuccess] = useState(false)

  const connectedIds = new Set(connectedPROs.map(p => p.id))
  const available = Object.values(PRO_REGISTRY).filter(p => !connectedIds.has(p.id))

  const handleConnect = () => {
    if (!selected || !accountId.trim()) return
    addPRO(selected.id, accountId.trim())
    setSuccess(true)
    setTimeout(() => navigate(`/pro/${selected.id}`), 1200)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 680, animation: 'fadeIn 0.3s ease forwards' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link to="/dashboard" style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', textDecoration: 'none',
        }}>
          <ArrowLeft size={14} />
        </Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Connect a PRO</h1>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Add your Performing Rights Organization account
          </p>
        </div>
      </div>

      {success ? (
        <GlassCard style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(52,211,153,0.15)',
            border: '1px solid rgba(52,211,153,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Check size={22} color="#34d399" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Connected!</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Redirecting to your {selected?.name} dashboard…</p>
        </GlassCard>
      ) : (
        <>
          {/* PRO Grid */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Select a PRO
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {Object.values(PRO_REGISTRY).map(pro => {
                const connected = connectedIds.has(pro.id)
                const isSelected = selected?.id === pro.id

                return (
                  <button
                    key={pro.id}
                    onClick={() => !connected && setSelected(pro)}
                    disabled={connected}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      border: isSelected
                        ? `1px solid ${pro.color}66`
                        : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected
                        ? `${pro.color}12`
                        : connected
                        ? 'rgba(255,255,255,0.02)'
                        : 'rgba(255,255,255,0.04)',
                      cursor: connected ? 'not-allowed' : 'pointer',
                      opacity: connected ? 0.5 : 1,
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!connected) e.currentTarget.style.background = `${pro.color}0f` }}
                    onMouseLeave={e => { if (!connected && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  >
                    {connected && (
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Check size={11} color="#34d399" />
                      </div>
                    )}
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: pro.color,
                      letterSpacing: '-0.02em', marginBottom: 4,
                    }}>
                      {pro.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                      {pro.country}
                    </div>
                    {connected && (
                      <div style={{ fontSize: 10, color: '#34d399', marginTop: 4 }}>Connected</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Account ID input */}
          {selected && (
            <GlassCard style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {selected.name} Account ID
              </p>
              <input
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                placeholder={`e.g. ${selected.name.toUpperCase()}-00123456`}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 13,
                  fontFamily: 'monospace',
                  outline: 'none',
                  marginBottom: 12,
                }}
                onFocus={e => e.target.style.borderColor = `${selected.color}66`}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                Find this in your {selected.name} account portal under{' '}
                <a href={`https://${selected.website}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: selected.color, textDecoration: 'none' }}>
                  {selected.website} <ExternalLink size={10} style={{ display: 'inline' }} />
                </a>
              </p>
            </GlassCard>
          )}

          <GlassButton
            variant="primary"
            onClick={handleConnect}
            disabled={!selected || !accountId.trim()}
          >
            <Plus size={14} />
            Connect {selected?.name || 'PRO'}
          </GlassButton>

          {available.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 16 }}>
              All supported PROs are connected. More integrations coming soon.
            </p>
          )}
        </>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  )
}
