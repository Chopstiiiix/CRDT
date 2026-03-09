import { Lock } from 'lucide-react'
import { useSubscription } from '../context/SubscriptionContext'
import { GlassCard, GlassButton } from './UI'

export default function UpgradeGate({ feature, children, message }) {
  const { canAccess, setShowPricing, currentTier } = useSubscription()

  if (canAccess(feature)) return children

  return (
    <GlassCard style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(251,191,36,0.1)',
        border: '1px solid rgba(251,191,36,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Lock size={18} color="#fbbf24" />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
        {message || 'This feature requires an upgrade'}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', maxWidth: 300 }}>
        You're on the <strong style={{ color: 'var(--text-secondary)' }}>{currentTier.name}</strong> plan.
        Upgrade to unlock this feature.
      </p>
      <GlassButton variant="primary" onClick={() => setShowPricing(true)}>
        View Plans
      </GlassButton>
    </GlassCard>
  )
}
