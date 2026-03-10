import React from 'react'

export function GlassCard({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={`glass ${className}`}
      style={{ borderRadius: 'var(--radius-lg)', padding: '20px', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function GlassButton({ children, onClick, variant = 'default', className = '', disabled = false, type = 'button' }) {
  const styles = {
    default: {
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'var(--text-primary)',
    },
    primary: {
      background: 'linear-gradient(135deg, rgba(74,158,255,0.3), rgba(74,158,255,0.15))',
      border: '1px solid rgba(74,158,255,0.4)',
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'rgba(248,113,113,0.1)',
      border: '1px solid rgba(248,113,113,0.25)',
      color: '#f87171',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`hover-brighten ${className}`}
      style={{
        ...styles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

export function Stat({ label, value, sub, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span
        className="num"
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: accent || 'var(--text-primary)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{sub}</span>
      )}
    </div>
  )
}

export function Badge({ children, color = '#4a9eff' }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 500,
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </h3>
      {action}
    </div>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--glass-border)', margin: '16px 0' }} />
}

export function Avatar({ name, size = 32 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  const colors = ['#4a9eff', '#2dd4bf', '#a78bfa', '#f87171', '#34d399', '#fbbf24']
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0]
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `${color}22`,
      border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35,
      fontWeight: 600,
      color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export function LoadingSpinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: 'var(--accent-blue)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}
