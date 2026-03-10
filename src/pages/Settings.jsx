import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePRO } from '../context/PROContext'
import { useCurrency } from '../hooks/useCurrency'
import { GlassCard, GlassButton, Badge, Divider, SectionHeader } from '../components/UI'
import { User, Bell, Shield, Palette, Trash2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Settings() {
  const { user } = useAuth()
  const { connectedPROs, removePRO } = usePRO()
  const { currency, setCurrency, currencies } = useCurrency()
  const [notifs, setNotifs] = useState({ payments: true, statements: true, news: false })

  return (
    <div style={{ padding: '28px 32px', maxWidth: 640, animation: 'fadeIn 0.3s ease forwards' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>Settings</h1>

      {/* Profile */}
      <GlassCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Profile" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Connected PROs */}
      <GlassCard style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionHeader title={`Connected PROs · ${connectedPROs.length}`} />
          <Link to="/connect" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>
            + Add PRO
          </Link>
        </div>
        {connectedPROs.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No PROs connected yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {connectedPROs.map(pro => (
              <div key={pro.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: pro.color, boxShadow: `0 0 6px ${pro.color}88` }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{pro.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{pro.accountId}</div>
                  </div>
                </div>
                <button
                  onClick={() => removePRO(pro.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                  className="hover-text-red"
                  title={`Disconnect ${pro.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Preferences */}
      <GlassCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Preferences" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Display Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{
                padding: '9px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 9,
                color: '#fff',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {currencies.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>{c}</option>)}
            </select>
          </div>

          <Divider />

          <div>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Notifications</p>
            {[
              { key: 'payments', label: 'Payment received', desc: 'When a PRO distributes earnings' },
              { key: 'statements', label: 'New statements', desc: 'Quarterly royalty statements ready' },
              { key: 'news', label: 'Product updates', desc: 'New features and announcements' },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{n.desc}</div>
                </div>
                <div
                  onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  style={{
                    width: 36, height: 20,
                    borderRadius: 10,
                    background: notifs[n.key] ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.1)',
                    border: notifs[n.key] ? '1px solid rgba(74,158,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 2, left: notifs[n.key] ? 18 : 2,
                    width: 14, height: 14,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Email Notifications */}
      <GlassCard style={{ marginBottom: 14 }}>
        <SectionHeader title="Email Notifications" />
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Receive email alerts when new payments are detected across your PRO accounts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'email_payments', label: 'Payment alerts', desc: 'Get notified when a PRO distributes earnings to your account' },
            { key: 'email_statements', label: 'Statement alerts', desc: 'Receive an email when new quarterly statements are available' },
          ].map(n => (
            <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{n.desc}</div>
              </div>
              <div
                onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: notifs[n.key] ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.1)',
                  border: notifs[n.key] ? '1px solid rgba(74,158,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: notifs[n.key] ? 18 : 2,
                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          ))}
          <Divider />
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Minimum payment threshold
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                defaultValue={0}
                min={0}
                style={{
                  padding: '9px 12px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
                  color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 120,
                }}
                placeholder="0"
              />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Only notify for payments above this amount ({currency})
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 24 }}>
        RoyalTrack v0.2.0 · More PRO integrations coming soon
      </p>

      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  )
}
