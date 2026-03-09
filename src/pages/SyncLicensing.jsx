import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Film, Tv, Gamepad2, Megaphone, Play, Globe,
  Plus, DollarSign, Calendar, X, Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePRO } from '../context/PROContext'
import { useSubscription } from '../context/SubscriptionContext'
import { GlassCard, GlassButton, Badge, SectionHeader, Divider } from '../components/UI'
import UpgradeGate from '../components/UpgradeGate'

const TYPE_ICONS = {
  Film: <Film size={14} />,
  TV: <Tv size={14} />,
  Commercial: <Megaphone size={14} />,
  'Video Game': <Gamepad2 size={14} />,
  Trailer: <Play size={14} />,
  'Web/Streaming': <Globe size={14} />,
  Other: <Film size={14} />,
}

const STATUS_COLORS = {
  active: '#34d399',
  pending: '#fbbf24',
  expired: 'rgba(255,255,255,0.3)',
  negotiating: '#a78bfa',
}

function fmt(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0)
}

export default function SyncLicensing() {
  const { canAccess, currentTier, setShowPricing } = useSubscription()
  const { authFetch } = useAuth()
  const { connectedPROs } = usePRO()
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    proId: '', workTitle: '', licensee: '', projectType: 'Film',
    territory: 'Worldwide', fee: '', startDate: '', endDate: '', status: 'negotiating', notes: '',
  })

  useEffect(() => {
    if (!authFetch) return
    authFetch('/api/sync-licenses')
      .then(r => r.json())
      .then(data => { setLicenses(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authFetch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await authFetch('/api/sync-licenses', {
      method: 'POST',
      body: JSON.stringify({ ...form, fee: parseFloat(form.fee) || 0 }),
    })
    if (res.ok) {
      const newLicense = await res.json()
      setLicenses(prev => [newLicense, ...prev])
      setShowForm(false)
      setForm({ proId: '', workTitle: '', licensee: '', projectType: 'Film', territory: 'Worldwide', fee: '', startDate: '', endDate: '', status: 'negotiating', notes: '' })
    }
  }

  const handleDelete = async (id) => {
    await authFetch(`/api/sync-licenses/${id}`, { method: 'DELETE' })
    setLicenses(prev => prev.filter(l => l.id !== id))
  }

  if (!canAccess('syncLicensing')) {
    return (
      <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease forwards' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <Link to="/dashboard" style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', textDecoration: 'none',
          }}>
            <ArrowLeft size={14} />
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Sync Licensing</h1>
        </div>
        <UpgradeGate feature="syncLicensing" message="Sync Licensing requires a Special or Royal plan" />
        <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
      </div>
    )
  }

  // Apply sync license limit for Special tier
  const syncLimit = currentTier.features.syncLicensingLimit
  const visibleLicenses = syncLimit === Infinity ? licenses : licenses.slice(0, syncLimit)

  const totalFees = licenses.reduce((sum, l) => sum + (parseFloat(l.fee) || 0), 0)
  const activeLicenses = licenses.filter(l => l.status === 'active').length
  const pendingDeals = licenses.filter(l => l.status === 'negotiating' || l.status === 'pending').length

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease forwards' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/dashboard" style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', textDecoration: 'none',
          }}>
            <ArrowLeft size={14} />
          </Link>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Sync Licensing</h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Track placements in film, TV, games & more</p>
          </div>
        </div>
        <GlassButton variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New License</>}
        </GlassButton>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Sync Revenue', value: fmt(totalFees), icon: <DollarSign size={14} />, color: '#4a9eff' },
          { label: 'Active Licenses', value: activeLicenses, icon: <Check size={14} />, color: '#34d399' },
          { label: 'Pending Deals', value: pendingDeals, icon: <Calendar size={14} />, color: '#fbbf24' },
        ].map(s => (
          <GlassCard key={s.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${s.color}15`, border: `1px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
              }}>{s.icon}</div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
            </div>
            <span className="num" style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</span>
          </GlassCard>
        ))}
      </div>

      {/* New License Form */}
      {showForm && (
        <GlassCard style={{ marginBottom: 20 }}>
          <SectionHeader title="New Sync License" />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="PRO">
              <select value={form.proId} onChange={e => setForm(f => ({ ...f, proId: e.target.value }))} required style={selectStyle}>
                <option value="">Select PRO...</option>
                {connectedPROs.map(p => <option key={p.id} value={p.id} style={{ background: '#0a0f1e' }}>{p.name}</option>)}
              </select>
            </FormField>
            <FormField label="Work Title">
              <input value={form.workTitle} onChange={e => setForm(f => ({ ...f, workTitle: e.target.value }))} required style={inputStyle} placeholder="Song title" />
            </FormField>
            <FormField label="Licensee">
              <input value={form.licensee} onChange={e => setForm(f => ({ ...f, licensee: e.target.value }))} required style={inputStyle} placeholder="e.g. Netflix" />
            </FormField>
            <FormField label="Project Type">
              <select value={form.projectType} onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))} style={selectStyle}>
                {['Film', 'TV', 'Commercial', 'Video Game', 'Trailer', 'Web/Streaming', 'Other'].map(t =>
                  <option key={t} value={t} style={{ background: '#0a0f1e' }}>{t}</option>
                )}
              </select>
            </FormField>
            <FormField label="Territory">
              <input value={form.territory} onChange={e => setForm(f => ({ ...f, territory: e.target.value }))} style={inputStyle} />
            </FormField>
            <FormField label="License Fee">
              <input type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} style={inputStyle} placeholder="0" />
            </FormField>
            <FormField label="Start Date">
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inputStyle} />
            </FormField>
            <FormField label="End Date">
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inputStyle} />
            </FormField>
            <div style={{ gridColumn: '1 / -1' }}>
              <GlassButton variant="primary" type="submit">
                <Plus size={13} /> Add License
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Licenses List */}
      {loading ? (
        <GlassCard style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Loading...</GlassCard>
      ) : visibleLicenses.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: 40 }}>
          <Film size={28} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No sync licenses yet. Add your first placement above.</p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleLicenses.map(l => (
            <GlassCard key={l.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${STATUS_COLORS[l.status] || '#fff'}12`,
                    border: `1px solid ${STATUS_COLORS[l.status] || '#fff'}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: STATUS_COLORS[l.status],
                  }}>
                    {TYPE_ICONS[l.projectType] || TYPE_ICONS.Other}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{l.workTitle}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {l.licensee} · {l.projectType} · {l.territory}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{ fontSize: 16, fontWeight: 700, color: '#4a9eff' }}>{fmt(l.fee, l.currency)}</div>
                    <Badge color={STATUS_COLORS[l.status]}>{l.status}</Badge>
                  </div>
                  <button onClick={() => handleDelete(l.id)} style={{
                    background: 'none', border: 'none', color: 'var(--text-tertiary)',
                    cursor: 'pointer', padding: 4, fontSize: 16,
                  }} title="Delete">
                    <X size={14} />
                  </button>
                </div>
              </div>
              {l.startDate && (
                <>
                  <Divider />
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {l.startDate} — {l.endDate || 'Ongoing'}
                    {l.notes && <span> · {l.notes}</span>}
                  </div>
                </>
              )}
            </GlassCard>
          ))}
          {licenses.length > visibleLicenses.length && (
            <GlassCard style={{ textAlign: 'center', padding: '16px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                {licenses.length - visibleLicenses.length} more license{licenses.length - visibleLicenses.length > 1 ? 's' : ''} hidden.
                Upgrade to Royal for unlimited access.
              </p>
              <GlassButton variant="primary" onClick={() => setShowPricing(true)}>
                Upgrade Plan
              </GlassButton>
            </GlassCard>
          )}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
}
const selectStyle = { ...inputStyle, cursor: 'pointer' }

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
