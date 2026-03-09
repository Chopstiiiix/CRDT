import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Music2, Settings, LogOut, Plus, ChevronRight, Film, Crown, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePRO } from '../context/PROContext'
import { useSubscription } from '../context/SubscriptionContext'
import { Avatar } from './UI'

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const { connectedPROs } = usePRO()
  const { currentTier, setShowPricing, tier } = useSubscription()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
    fontWeight: 500,
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
    border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  })

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      background: 'rgba(6,7,13,0.7)',
      borderRight: '1px solid var(--glass-border)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
    }}>
      {/* Logo */}
      <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', marginBottom: 28, textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #4a9eff, #2dd4bf)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Music2 size={14} color="#fff" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>RoyalTrack</span>
      </NavLink>

      {/* Main nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLink to="/dashboard" style={({ isActive }) => navStyle(isActive)}>
          <LayoutDashboard size={15} />
          Overview
        </NavLink>
        <NavLink to="/sync-licensing" style={({ isActive }) => navStyle(isActive)}>
          <Film size={15} />
          Sync Licensing
        </NavLink>
        <NavLink to="/settings" style={({ isActive }) => navStyle(isActive)}>
          <Settings size={15} />
          Settings
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" style={({ isActive }) => ({
            ...navStyle(isActive),
            color: isActive ? '#a78bfa' : 'var(--text-secondary)',
            background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
            border: isActive ? '1px solid rgba(167,139,250,0.2)' : '1px solid transparent',
          })}>
            <Shield size={15} />
            Admin
          </NavLink>
        )}
      </nav>

      {/* PRO Accounts */}
      <div style={{ marginTop: 28, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px', marginBottom: 8
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
            My PROs
          </span>
          <NavLink
            to="/connect"
            title="Add PRO"
            style={{
              width: 18, height: 18,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            <Plus size={11} />
          </NavLink>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto', flex: 1 }}>
          {connectedPROs.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 8px' }}>
              No PROs connected yet
            </span>
          )}
          {connectedPROs.map(pro => (
            <NavLink
              key={pro.id}
              to={`/pro/${pro.id}`}
              style={({ isActive }) => ({
                ...navStyle(isActive),
                justifyContent: 'space-between',
                paddingLeft: 10,
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: pro.color,
                  boxShadow: `0 0 6px ${pro.color}88`,
                  flexShrink: 0,
                }} />
                <span>{pro.name}</span>
              </div>
              <ChevronRight size={12} style={{ opacity: 0.4 }} />
            </NavLink>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {tier !== 'royal' && (
        <button
          onClick={() => setShowPricing(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(251,191,36,0.25)',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.02))',
            color: '#fbbf24',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.02))'}
        >
          <Crown size={13} />
          <span>Upgrade</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(251,191,36,0.6)', textTransform: 'uppercase' }}>
            {currentTier.name}
          </span>
        </button>
      )}

      {/* User */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 10px',
        borderTop: '1px solid var(--glass-border)',
        marginTop: tier === 'royal' ? 12 : 0,
      }}>
        <Avatar name={user?.name || user?.email} size={28} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || user?.email}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Musician</div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-tertiary)', cursor: 'pointer',
            padding: 4, borderRadius: 6, display: 'flex',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
