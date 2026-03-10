import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Music2, Settings, LogOut, Plus, ChevronRight, Film, Crown, Shield, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePRO } from '../context/PROContext'
import { useSubscription } from '../context/SubscriptionContext'
import { Avatar } from './UI'

const EXPANDED_W = 240
const COLLAPSED_W = 60

export default function Sidebar({ onWidthChange }) {
  const { user, logout, isAdmin } = useAuth()
  const { connectedPROs } = usePRO()
  const { currentTier, setShowPricing, tier } = useSubscription()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(true)
  const sidebarRef = useRef(null)

  const w = collapsed ? COLLAPSED_W : EXPANDED_W

  const collapse = () => {
    setCollapsed(true)
    onWidthChange?.(COLLAPSED_W)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const expand = () => {
    if (collapsed) {
      setCollapsed(false)
      onWidthChange?.(EXPANDED_W)
    }
  }

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    onWidthChange?.(next ? COLLAPSED_W : EXPANDED_W)
  }

  const handleNavClick = () => {
    expand()
  }

  const navStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : 10,
    padding: collapsed ? '9px 0' : '9px 12px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
    fontWeight: 500,
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
    border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
    textDecoration: 'none',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  })

  return (
    <aside ref={sidebarRef} onMouseEnter={expand} onMouseLeave={collapse} style={{
      width: w,
      minWidth: w,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      padding: collapsed ? '20px 8px' : '20px 14px',
      background: 'rgba(10,10,10,0.85)',
      borderRight: '1px solid var(--glass-border)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    }}>
      {/* Logo + collapse toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <NavLink to="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: collapsed ? '4px 0' : '4px 8px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: collapsed ? '100%' : 'auto',
          textDecoration: 'none', color: 'inherit',
          transition: 'all 0.25s ease',
        }}>
          <div style={{
            width: 28, height: 28, flexShrink: 0,
            background: 'linear-gradient(135deg, #4a9eff, #2dd4bf)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Music2 size={14} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>RoyalTrack</span>
          )}
        </NavLink>
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="hover-brighten"
            title="Collapse sidebar"
            style={{
              background: 'none', border: 'none', color: 'var(--text-tertiary)',
              cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex',
              transition: 'color 0.15s',
            }}
          >
            <PanelLeftClose size={14} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={toggleCollapse}
          className="hover-brighten"
          title="Expand sidebar"
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-tertiary)', cursor: 'pointer',
            padding: 6, borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, transition: 'all 0.2s',
          }}
        >
          <PanelLeftOpen size={14} />
        </button>
      )}

      {/* Main nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLink to="/dashboard" onClick={handleNavClick} style={({ isActive }) => navStyle(isActive)} title="Overview">
          <LayoutDashboard size={15} style={{ flexShrink: 0 }} />
          {!collapsed && 'Overview'}
        </NavLink>
        <NavLink to="/sync-licensing" onClick={handleNavClick} style={({ isActive }) => navStyle(isActive)} title="Sync Licensing">
          <Film size={15} style={{ flexShrink: 0 }} />
          {!collapsed && 'Sync Licensing'}
        </NavLink>
        <NavLink to="/settings" onClick={handleNavClick} style={({ isActive }) => navStyle(isActive)} title="Settings">
          <Settings size={15} style={{ flexShrink: 0 }} />
          {!collapsed && 'Settings'}
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" onClick={handleNavClick} style={({ isActive }) => ({
            ...navStyle(isActive),
            color: isActive ? '#a78bfa' : 'var(--text-secondary)',
            background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
            border: isActive ? '1px solid rgba(167,139,250,0.2)' : '1px solid transparent',
          })} title="Admin">
            <Shield size={15} style={{ flexShrink: 0 }} />
            {!collapsed && 'Admin'}
          </NavLink>
        )}
      </nav>

      {/* PRO Accounts */}
      <div style={{
        marginTop: 28, flex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.25s ease',
      }}>
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 8px', marginBottom: 8,
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
              My PROs
            </span>
            <NavLink
              to="/connect"
              title="Add PRO"
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', textDecoration: 'none',
              }}
            >
              <Plus size={11} />
            </NavLink>
          </div>
        )}

        {collapsed && connectedPROs.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <NavLink
              to="/connect"
              title="Add PRO"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)', textDecoration: 'none',
              }}
            >
              <Plus size={12} />
            </NavLink>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto', flex: 1 }}>
          {!collapsed && connectedPROs.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 8px' }}>
              No PROs connected yet
            </span>
          )}
          {connectedPROs.map(pro => (
            <NavLink
              key={pro.id}
              to={`/pro/${pro.id}`}
              onClick={handleNavClick}
              title={pro.name}
              style={({ isActive }) => ({
                ...navStyle(isActive),
                justifyContent: collapsed ? 'center' : 'space-between',
                paddingLeft: collapsed ? 0 : 10,
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 8 }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: pro.color,
                  boxShadow: `0 0 6px ${pro.color}88`,
                  flexShrink: 0,
                }} />
                {!collapsed && <span>{pro.name}</span>}
              </div>
              {!collapsed && <ChevronRight size={12} style={{ opacity: 0.4 }} />}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {tier !== 'royal' && !isAdmin && (
        <button
          onClick={() => setShowPricing(true)}
          className="hover-brighten"
          title="Upgrade plan"
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%',
            padding: collapsed ? '10px 0' : '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(251,191,36,0.25)',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.02))',
            color: '#fbbf24',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            marginBottom: 8,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <Crown size={13} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <>
              <span>Upgrade</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(251,191,36,0.6)', textTransform: 'uppercase' }}>
                {currentTier.name}
              </span>
            </>
          )}
        </button>
      )}

      {/* User */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px 0' : '10px 10px',
        borderTop: '1px solid var(--glass-border)',
        marginTop: tier === 'royal' || isAdmin ? 12 : 0,
        transition: 'all 0.25s ease',
      }}>
        <Avatar name={user?.name || user?.email} size={28} />
        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || user?.email}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Musician</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="hover-text-red"
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-tertiary)', cursor: 'pointer',
                padding: 4, borderRadius: 6, display: 'flex',
                transition: 'color 0.15s',
              }}
            >
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
