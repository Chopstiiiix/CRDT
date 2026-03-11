import { useState } from 'react'
import { X, Check, Crown, Zap, Star } from 'lucide-react'
import { useSubscription, TIERS } from '../context/SubscriptionContext'

const TIER_CONFIG = {
  free: {
    icon: <Zap size={20} />,
    color: '#64748b',
    glowColor: 'rgba(100,116,139,0.15)',
    features: [
      { text: 'Connect 1 PRO account', included: true },
      { text: 'View catalogue', included: true },
      { text: 'View royalty statements', included: false },
      { text: 'Download / export data', included: false },
      { text: 'Sync licensing tracker', included: false },
      { text: 'Top markets chart', included: false },
      { text: 'Co-writer split view', included: false },
    ],
  },
  special: {
    icon: <Star size={20} />,
    color: '#4a9eff',
    glowColor: 'rgba(74,158,255,0.15)',
    badge: 'Most Popular',
    features: [
      { text: 'Connect up to 3 PROs', included: true },
      { text: 'View catalogue', included: true },
      { text: 'View royalty statements', included: true },
      { text: 'Download / export data', included: false },
      { text: 'View top 3 sync licenses', included: true },
      { text: 'Top markets chart', included: true },
      { text: 'Co-writer split view', included: true },
    ],
  },
  royal: {
    icon: <Crown size={20} />,
    color: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.15)',
    features: [
      { text: 'Unlimited PRO accounts', included: true },
      { text: 'Full catalogue access', included: true },
      { text: 'Full royalty statements', included: true },
      { text: 'CSV export & download', included: true },
      { text: 'Unlimited sync licensing', included: true },
      { text: 'Top markets chart', included: true },
      { text: 'Co-writer splits + all features', included: true },
    ],
  },
}

const STRIPE_LINKS = {
  special: 'https://buy.stripe.com/test_cNifZhg1w2bYfgpceoasg00?prefilled_promo_code=SPECIAL',
  royal: 'https://buy.stripe.com/test_cNifZhg1w2bYfgpceoasg00?prefilled_promo_code=ROYAL',
}

export default function PricingModal() {
  const { tier: currentTier, upgradeTo, setShowPricing } = useSubscription()
  const [hoveredTier, setHoveredTier] = useState(null)

  const handleUpgrade = (tierId) => {
    if (tierId === 'free') {
      upgradeTo(tierId)
      return
    }
    const link = STRIPE_LINKS[tierId]
    if (link) {
      window.open(link, '_blank')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'pricingFadeIn 0.25s ease forwards',
      }}
      onClick={(e) => e.target === e.currentTarget && setShowPricing(false)}
    >
      <div style={{
        width: '100%', maxWidth: 960, padding: '0 20px',
        animation: 'pricingScaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 20,
            background: 'rgba(74,158,255,0.1)',
            border: '1px solid rgba(74,158,255,0.2)',
            fontSize: 11, fontWeight: 600, color: '#4a9eff',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 16,
          }}>
            <Crown size={12} /> Choose your plan
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Unlock your full royalty potential
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto' }}>
            Track, manage and grow your music royalties with the plan that fits your career.
          </p>
        </div>

        {/* Close */}
        <button
          onClick={() => setShowPricing(false)}
          style={{
            position: 'absolute', top: 24, right: 24,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {Object.entries(TIER_CONFIG).map(([tierId, config]) => {
            const tierData = TIERS[tierId]
            const isActive = currentTier === tierId
            const isHovered = hoveredTier === tierId
            const isMiddle = tierId === 'special'

            return (
              <div
                key={tierId}
                onMouseEnter={() => setHoveredTier(tierId)}
                onMouseLeave={() => setHoveredTier(null)}
                style={{
                  position: 'relative',
                  borderRadius: 20,
                  padding: '28px 24px',
                  background: isMiddle
                    ? 'linear-gradient(180deg, rgba(74,158,255,0.08) 0%, rgba(6,7,13,0.95) 100%)'
                    : 'rgba(6,7,13,0.9)',
                  border: isMiddle
                    ? '1px solid rgba(74,158,255,0.3)'
                    : isHovered
                    ? `1px solid ${config.color}44`
                    : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 20px 60px ${config.glowColor}, 0 0 40px ${config.glowColor}`
                    : isMiddle
                    ? '0 8px 40px rgba(74,158,255,0.1)'
                    : 'none',
                  overflow: 'hidden',
                }}
              >
                {/* Glow orb */}
                <div style={{
                  position: 'absolute', top: -60, right: -60,
                  width: 160, height: 160, borderRadius: '50%',
                  background: `radial-gradient(circle, ${config.color}15, transparent 70%)`,
                  opacity: isHovered ? 1 : 0.3,
                  transition: 'opacity 0.4s',
                  pointerEvents: 'none',
                }} />

                {/* Badge */}
                {config.badge && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    padding: '3px 10px', borderRadius: 8,
                    background: 'rgba(74,158,255,0.15)',
                    border: '1px solid rgba(74,158,255,0.3)',
                    fontSize: 10, fontWeight: 600, color: '#4a9eff',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {config.badge}
                  </div>
                )}

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${config.color}15`,
                  border: `1px solid ${config.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: config.color,
                  marginBottom: 18,
                }}>
                  {config.icon}
                </div>

                {/* Name + Price */}
                <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
                  {tierData.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span className="num" style={{ fontSize: 36, fontWeight: 800, color: config.color, lineHeight: 1 }}>
                    {tierData.price === 0 ? 'Free' : `$${tierData.price}`}
                  </span>
                  {tierData.price > 0 && (
                    <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>/month</span>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 18px' }} />

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 24 }}>
                  {config.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 6,
                        background: f.included ? `${config.color}18` : 'rgba(255,255,255,0.04)',
                        border: f.included ? `1px solid ${config.color}35` : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {f.included ? (
                          <Check size={10} color={config.color} strokeWidth={3} />
                        ) : (
                          <X size={9} color="rgba(255,255,255,0.2)" strokeWidth={2.5} />
                        )}
                      </div>
                      <span style={{ color: f.included ? 'var(--text-secondary)' : 'rgba(255,255,255,0.25)' }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(tierId)}
                  disabled={isActive}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    border: isActive
                      ? `1px solid ${config.color}30`
                      : isMiddle
                      ? '1px solid rgba(74,158,255,0.4)'
                      : `1px solid ${config.color}25`,
                    background: isActive
                      ? `${config.color}10`
                      : isMiddle
                      ? 'linear-gradient(135deg, rgba(74,158,255,0.35), rgba(45,212,191,0.15))'
                      : `${config.color}12`,
                    color: isActive ? config.color : '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isActive ? 0.7 : 1,
                  }}
                >
                  {isActive ? 'Current Plan' : tierData.price === 0 ? 'Get Started' : `Upgrade to ${tierData.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 20 }}>
          Cancel anytime. No contracts. Prices in USD.
        </p>
      </div>

      <style>{`
        @keyframes pricingFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pricingScaleIn { from { opacity: 0; transform: scale(0.95) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  )
}
