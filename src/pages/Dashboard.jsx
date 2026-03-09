import { Link } from 'react-router-dom'
import { TrendingUp, DollarSign, Music, AlertCircle, Plus, ArrowRight, ChevronRight } from 'lucide-react'
import { usePRO } from '../context/PROContext'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../hooks/useCurrency'
import { GlassCard, Stat, Badge, SectionHeader } from '../components/UI'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <span style={{ textTransform: 'capitalize' }}>{p.name}</span>
          <span className="num">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { connectedPROs } = usePRO()
  const { fmt, currency, setCurrency, currencies } = useCurrency()

  const totalEarnings = connectedPROs.reduce((sum, p) => sum + (p.data?.totalEarnings || 0), 0)
  const pendingBalance = connectedPROs.reduce((sum, p) => sum + (p.data?.pendingBalance || 0), 0)
  const totalCatalogue = connectedPROs.reduce((sum, p) => sum + (p.data?.catalogueCount || 0), 0)

  // Aggregate monthly data across all PROs
  const combinedMonthly = connectedPROs.length > 0
    ? connectedPROs[0].data.monthly.map((m, i) => ({
        month: m.month,
        total: connectedPROs.reduce((sum, p) => {
          const mo = p.data.monthly[i]
          return sum + mo.performance + mo.mechanical + mo.sync + mo.digital
        }, 0),
      }))
    : []

  const name = user?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Good morning, {name} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {connectedPROs.length} PRO account{connectedPROs.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          style={{
            padding: '7px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9,
            color: '#fff',
            fontSize: 12,
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {currencies.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>{c}</option>)}
        </select>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={14} color="#4a9eff" />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Earnings (12mo)</span>
          </div>
          <Stat value={fmt(totalEarnings)} sub="All PROs combined" accent="#4a9eff" />
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#34d399" />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pending Balance</span>
          </div>
          <Stat value={fmt(pendingBalance)} sub="Awaiting distribution" accent="#34d399" />
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={14} color="#a78bfa" />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Works</span>
          </div>
          <Stat value={totalCatalogue} sub="Registered titles" accent="#a78bfa" />
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Combined earnings chart */}
        <GlassCard style={{ padding: '20px 20px 12px' }}>
          <SectionHeader title="Combined Earnings — 12 Months" />
          {combinedMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={combinedMonthly} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4a9eff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4a9eff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#4a9eff" strokeWidth={2} fill="url(#grad-total)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </GlassCard>

        {/* PRO breakdown list */}
        <GlassCard>
          <SectionHeader
            title="PRO Accounts"
            action={
              <Link to="/connect" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>
                <Plus size={12} /> Add
              </Link>
            }
          />
          {connectedPROs.length === 0 ? (
            <EmptyPROs />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {connectedPROs.map(pro => (
                <Link
                  key={pro.id}
                  to={`/pro/${pro.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{
                    width: 34, height: 34,
                    borderRadius: 9,
                    background: `${pro.color}15`,
                    border: `1px solid ${pro.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: pro.color,
                    letterSpacing: '-0.02em',
                    flexShrink: 0,
                  }}>
                    {pro.name.slice(0, 3)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{pro.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{pro.data?.catalogueCount} works</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{ fontSize: 13, fontWeight: 600, color: pro.color }}>
                      {fmt(pro.data?.totalEarnings || 0)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>12mo</div>
                  </div>
                  <ChevronRight size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <AlertCircle size={22} style={{ color: 'var(--text-tertiary)' }} />
      <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No data yet</span>
    </div>
  )
}

function EmptyPROs() {
  return (
    <Link to="/connect" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: '32px 16px', textDecoration: 'none',
      border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12,
      color: 'var(--text-tertiary)',
    }}>
      <Plus size={22} />
      <span style={{ fontSize: 13 }}>Connect your first PRO</span>
    </Link>
  )
}
