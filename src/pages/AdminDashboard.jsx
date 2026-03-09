import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Users, Music2, FileText, Film, DollarSign,
  TrendingUp, ShieldAlert, ShieldCheck, ShieldX, Search,
  ChevronRight, BarChart3, Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GlassCard, GlassButton, Badge, Avatar, Divider } from '../components/UI'

const PRO_COLORS = {
  bmi: '#4a9eff', ascap: '#34d399', prs: '#a78bfa',
  songtrust: '#f87171', sesac: '#fbbf24', socan: '#2dd4bf',
}
const PRO_NAMES = {
  bmi: 'BMI', ascap: 'ASCAP', prs: 'PRS',
  songtrust: 'Songtrust', sesac: 'SESAC', socan: 'SOCAN',
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
}

export default function AdminDashboard() {
  const { authFetch } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [suspendModal, setSuspendModal] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!authFetch) return
    Promise.all([
      authFetch('/api/admin/stats').then(r => r.json()),
      authFetch('/api/admin/users').then(r => r.json()),
    ]).then(([s, u]) => {
      setStats(s)
      setUsers(Array.isArray(u) ? u : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [authFetch])

  const handleSuspend = async (userId) => {
    const res = await authFetch(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason: suspendReason || 'Flagged for suspicious activity' }),
    })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId
        ? { ...u, suspended: true, suspended_reason: suspendReason || 'Flagged for suspicious activity', suspended_at: new Date().toISOString() }
        : u
      ))
      setSuspendModal(null)
      setSuspendReason('')
    }
  }

  const handleUnsuspend = async (userId) => {
    const res = await authFetch(`/api/admin/users/${userId}/unsuspend`, { method: 'POST' })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId
        ? { ...u, suspended: false, suspended_reason: null, suspended_at: null }
        : u
      ))
    }
  }

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const suspendedCount = users.filter(u => u.suspended).length

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease forwards' }}>
        <GlassCard style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
          Loading admin data...
        </GlassCard>
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, animation: 'fadeIn 0.3s ease forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link to="/dashboard" style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', textDecoration: 'none',
        }}>
          <ArrowLeft size={14} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
            <Badge color="#a78bfa">Admin</Badge>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Platform overview & user management</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 size={13} /> },
          { id: 'users', label: 'Users', icon: <Users size={13} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: tab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={15} />, color: '#4a9eff' },
              { label: 'PRO Connections', value: stats?.totalConnections || 0, icon: <Globe size={15} />, color: '#2dd4bf' },
              { label: 'Catalogue Works', value: stats?.totalWorks || 0, icon: <Music2 size={15} />, color: '#a78bfa' },
              { label: 'Sync Licenses', value: stats?.totalLicenses || 0, icon: <Film size={15} />, color: '#fbbf24' },
            ].map(s => (
              <GlassCard key={s.label} style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: `${s.color}12`, border: `1px solid ${s.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
                  }}>{s.icon}</div>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                </div>
                <span className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</span>
              </GlassCard>
            ))}
          </div>

          {/* Revenue + Distribution Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* Revenue Card */}
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <DollarSign size={14} color="#34d399" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Platform Revenue</span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Royalties</div>
                  <span className="num" style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>{fmt(stats?.totalRevenue)}</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sync Revenue</div>
                  <span className="num" style={{ fontSize: 22, fontWeight: 700, color: '#4a9eff' }}>{fmt(stats?.totalSyncRevenue)}</span>
                </div>
              </div>
              <Divider />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={12} color="#34d399" />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {stats?.recentSignups || 0} new users in the last 30 days
                </span>
              </div>
            </GlassCard>

            {/* PRO Distribution */}
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <BarChart3 size={14} color="#a78bfa" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>PRO Distribution</span>
              </div>
              {stats?.proDistribution && Object.keys(stats.proDistribution).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(stats.proDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([proId, count]) => {
                      const total = stats.totalConnections || 1
                      const pct = Math.round((count / total) * 100)
                      const color = PRO_COLORS[proId] || '#4a9eff'
                      return (
                        <div key={proId}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>{PRO_NAMES[proId] || proId}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                            <div style={{ height: '100%', borderRadius: 2, background: color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No PRO connections yet</span>
              )}
            </GlassCard>
          </div>

          {/* Quick User Overview */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={14} color="#fbbf24" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Account Status</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{users.length - suspendedCount} Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{suspendedCount} Suspended</span>
                </div>
              </div>
            </div>
            <div style={{
              height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              display: 'flex',
            }}>
              <div style={{
                height: '100%', background: '#34d399',
                width: users.length ? `${((users.length - suspendedCount) / users.length) * 100}%` : '100%',
                transition: 'width 0.5s ease',
              }} />
              {suspendedCount > 0 && (
                <div style={{
                  height: '100%', background: '#f87171',
                  width: `${(suspendedCount / users.length) * 100}%`,
                  transition: 'width 0.5s ease',
                }} />
              )}
            </div>
            <button
              onClick={() => setTab('users')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 14, background: 'none', border: 'none',
                color: '#4a9eff', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', padding: 0,
              }}
            >
              Manage Users <ChevronRight size={12} />
            </button>
          </GlassCard>
        </>
      )}

      {tab === 'users' && (
        <>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(74,158,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Users List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 80px 140px',
              gap: 12, padding: '8px 18px', fontSize: 11,
              color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <span>User</span>
              <span>PROs</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {filtered.length === 0 ? (
              <GlassCard style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)', fontSize: 13 }}>
                {search ? 'No users match your search' : 'No users found'}
              </GlassCard>
            ) : (
              filtered.map(u => (
                <GlassCard key={u.id} style={{
                  padding: '12px 18px',
                  opacity: u.suspended ? 0.7 : 1,
                  borderColor: u.suspended ? 'rgba(248,113,113,0.2)' : undefined,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 140px', gap: 12, alignItems: 'center' }}>
                    {/* User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <Avatar name={u.name || u.email} size={32} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.name || 'Unnamed'}
                          </span>
                          {u.role === 'admin' && <Badge color="#a78bfa">Admin</Badge>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>

                    {/* PRO Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {u.pros?.slice(0, 3).map(proId => (
                        <div key={proId} style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: PRO_COLORS[proId] || '#4a9eff',
                          boxShadow: `0 0 4px ${PRO_COLORS[proId] || '#4a9eff'}66`,
                        }} />
                      ))}
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 2 }}>
                        {u.proCount}
                      </span>
                    </div>

                    {/* Status */}
                    {u.suspended ? (
                      <Badge color="#f87171">Suspended</Badge>
                    ) : (
                      <Badge color="#34d399">Active</Badge>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      {u.role !== 'admin' && (
                        u.suspended ? (
                          <button
                            onClick={() => handleUnsuspend(u.id)}
                            title="Reactivate account"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 500,
                              fontFamily: 'inherit', cursor: 'pointer',
                              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                              color: '#34d399', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.1)'}
                          >
                            <ShieldCheck size={11} /> Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModal(u)}
                            title="Suspend account"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 500,
                              fontFamily: 'inherit', cursor: 'pointer',
                              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                              color: '#f87171', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                          >
                            <ShieldX size={11} /> Suspend
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Suspended reason */}
                  {u.suspended && u.suspended_reason && (
                    <div style={{
                      marginTop: 8, padding: '6px 10px', borderRadius: 6,
                      background: 'rgba(248,113,113,0.06)', fontSize: 11, color: 'var(--text-tertiary)',
                    }}>
                      Reason: {u.suspended_reason}
                      {u.suspended_at && <span> · {new Date(u.suspended_at).toLocaleDateString()}</span>}
                    </div>
                  )}
                </GlassCard>
              ))
            )}
          </div>
        </>
      )}

      {/* Suspend Modal */}
      {suspendModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}
          onClick={() => setSuspendModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 420, maxWidth: '90vw',
              background: 'rgba(12,15,28,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: 28,
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldAlert size={16} color="#f87171" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Suspend Account</h3>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {suspendModal.name || suspendModal.email}
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              This will temporarily disable the user's access. They won't be able to log in until reactivated.
            </p>

            <label style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Reason (optional)
            </label>
            <input
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="e.g. Suspicious login activity"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 9, color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                marginBottom: 18,
              }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <GlassButton onClick={() => { setSuspendModal(null); setSuspendReason('') }}>
                Cancel
              </GlassButton>
              <GlassButton variant="danger" onClick={() => handleSuspend(suspendModal.id)}>
                <ShieldX size={13} /> Suspend User
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  )
}
