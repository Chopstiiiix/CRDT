import { useParams, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft, DollarSign, Music, FileText, TrendingUp,
  ExternalLink, Trash2, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import { usePRO } from '../context/PROContext'
import { GlassCard, Stat, Badge, SectionHeader, Divider, GlassButton } from '../components/UI'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
}

const TABS = ['Overview', 'Catalogue', 'Statements']

const StatusBadge = ({ status }) => {
  const map = {
    active: { color: '#34d399', label: 'Active' },
    pending: { color: '#fbbf24', label: 'Pending' },
    inactive: { color: 'rgba(255,255,255,0.3)', label: 'Inactive' },
    paid: { color: '#34d399', label: 'Paid' },
    processing: { color: '#fbbf24', label: 'Processing' },
  }
  const s = map[status] || map.inactive
  return <Badge color={s.color}>{s.label}</Badge>
}

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

export default function PRODashboard() {
  const { proId } = useParams()
  const { getPRO, removePRO } = usePRO()
  const [tab, setTab] = useState('Overview')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const pro = getPRO(proId)
  if (!pro) return <Navigate to="/dashboard" replace />

  const { data } = pro
  const colors = ['#4a9eff', '#2dd4bf', '#a78bfa', '#f87171']

  const handleRemove = () => {
    removePRO(proId)
  }

  const latestMonth = data.monthly[data.monthly.length - 1]
  const breakdownData = [
    { name: 'Performance', value: latestMonth?.performance || 0 },
    { name: 'Mechanical', value: latestMonth?.mechanical || 0 },
    { name: 'Sync', value: latestMonth?.sync || 0 },
    { name: 'Digital', value: latestMonth?.digital || 0 },
  ]

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/dashboard" style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', textDecoration: 'none',
            transition: 'background 0.15s',
          }}>
            <ArrowLeft size={14} />
          </Link>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${pro.color}15`,
            border: `1px solid ${pro.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: pro.color,
            letterSpacing: '-0.02em',
          }}>
            {pro.name.slice(0, 3)}
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>{pro.fullName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Account: {pro.accountId}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{pro.country}</span>
              <a
                href={`https://${pro.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: pro.color, textDecoration: 'none' }}
              >
                <ExternalLink size={10} />
                {pro.website}
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!confirmDelete ? (
            <GlassButton variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={13} />
              Disconnect
            </GlassButton>
          ) : (
            <>
              <GlassButton variant="danger" onClick={handleRemove}>Confirm Remove</GlassButton>
              <GlassButton variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</GlassButton>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 22,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: 12, padding: 4, width: 'fit-content'
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 16px',
              borderRadius: 9,
              border: 'none',
              background: tab === t ? `${pro.color}20` : 'transparent',
              color: tab === t ? pro.color : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.15s',
              outline: tab === t ? `1px solid ${pro.color}44` : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab pro={pro} data={data} colors={colors} breakdownData={breakdownData} fmt={fmt} CustomTooltip={CustomTooltip} />}
      {tab === 'Catalogue' && <CatalogueTab data={data} pro={pro} fmt={fmt} />}
      {tab === 'Statements' && <StatementsTab data={data} pro={pro} fmt={fmt} />}

      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  )
}

function OverviewTab({ pro, data, colors, breakdownData, fmt, CustomTooltip }) {
  const totalPrev = data.monthly.slice(0, 6).reduce((s, m) => s + m.performance + m.mechanical + m.sync + m.digital, 0)
  const totalCurr = data.monthly.slice(6).reduce((s, m) => s + m.performance + m.mechanical + m.sync + m.digital, 0)
  const pct = totalPrev > 0 ? ((totalCurr - totalPrev) / totalPrev * 100).toFixed(1) : 0
  const up = pct >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Earnings', value: fmt(data.totalEarnings), icon: <DollarSign size={14} />, color: pro.color },
          { label: 'Pending Balance', value: fmt(data.pendingBalance), icon: <Clock size={14} />, color: '#fbbf24' },
          { label: 'Registered Works', value: data.catalogueCount, icon: <Music size={14} />, color: '#a78bfa' },
          { label: 'YoY Growth', value: `${up ? '+' : ''}${pct}%`, icon: <TrendingUp size={14} />, color: up ? '#34d399' : '#f87171' },
        ].map(s => (
          <GlassCard key={s.label}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `${s.color}15`, border: `1px solid ${s.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, marginBottom: 12,
            }}>
              {s.icon}
            </div>
            <Stat label={s.label} value={s.value} accent={s.color} />
          </GlassCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Area chart */}
        <GlassCard style={{ padding: '20px 20px 12px' }}>
          <SectionHeader title="Monthly Earnings Breakdown" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.monthly} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                {['performance', 'mechanical', 'sync', 'digital'].map((k, i) => (
                  <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[i]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              {['performance', 'mechanical', 'sync', 'digital'].map((k, i) => (
                <Area key={k} type="monotone" dataKey={k} stroke={colors[i]} strokeWidth={1.5} fill={`url(#g-${k})`} dot={false} stackId="1" />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Pie breakdown */}
        <GlassCard>
          <SectionHeader title="This Month" />
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                {breakdownData.map((_, i) => <Cell key={i} fill={colors[i]} opacity={0.85} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {breakdownData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[i] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span className="num" style={{ color: colors[i], fontWeight: 500 }}>{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Top Countries */}
      <GlassCard>
        <SectionHeader title="Top Markets" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.topCountries.map((c, i) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 120 }}>{c.name}</span>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${c.pct}%`,
                  background: `linear-gradient(90deg, ${pro.color}, ${pro.color}88)`,
                  transition: 'width 1s ease',
                }} />
              </div>
              <span className="num" style={{ fontSize: 12, color: 'var(--text-secondary)', width: 32, textAlign: 'right' }}>{c.pct}%</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function CatalogueTab({ data, pro, fmt }) {
  const [search, setSearch] = useState('')
  const filtered = data.catalogue.filter(w =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.iswc.includes(search)
  )

  return (
    <GlassCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionHeader title={`Works · ${data.catalogue.length}`} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search title or ISWC…"
          style={{
            padding: '7px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9,
            color: '#fff',
            fontSize: 12,
            fontFamily: 'inherit',
            outline: 'none',
            width: 200,
          }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Title', 'ISWC', 'Registered', 'Type', 'Earned', 'Last Payment', 'Status'].map(h => (
              <th key={h} style={{
                padding: '8px 10px', textAlign: 'left',
                fontSize: 11, color: 'var(--text-tertiary)',
                fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em',
                borderBottom: '1px solid var(--glass-border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((w, i) => (
            <tr
              key={w.id}
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '11px 10px', fontSize: 13, fontWeight: 500 }}>{w.title}</td>
              <td style={{ padding: '11px 10px', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{w.iswc}</td>
              <td style={{ padding: '11px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>{w.registered}</td>
              <td style={{ padding: '11px 10px' }}><Badge color={pro.color}>{w.usageType}</Badge></td>
              <td style={{ padding: '11px 10px' }}>
                <span className="num" style={{ fontSize: 13, fontWeight: 600, color: pro.color }}>{fmt(w.totalEarned)}</span>
              </td>
              <td style={{ padding: '11px 10px' }}>
                <span className="num" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmt(w.lastPayment)}</span>
              </td>
              <td style={{ padding: '11px 10px' }}><StatusBadge status={w.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No results</div>
      )}
    </GlassCard>
  )
}

function StatementsTab({ data, pro, fmt }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.statements.map(s => (
        <GlassCard key={s.id} style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: s.status === 'paid' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                border: `1px solid ${s.status === 'paid' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.status === 'paid'
                  ? <CheckCircle size={16} color="#34d399" />
                  : <Clock size={16} color="#fbbf24" />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.period} Royalty Statement</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Issued {s.issued}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 16, fontWeight: 700, color: pro.color }}>{fmt(s.total)}</div>
                <StatusBadge status={s.status} />
              </div>
            </div>
          </div>

          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {Object.entries(s.breakdown).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{k}</div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${v}%`, background: pro.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}%</div>
              </div>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
