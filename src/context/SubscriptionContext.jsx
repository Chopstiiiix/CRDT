import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const SubscriptionContext = createContext(null)

export const TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    maxPROs: 1,
    features: {
      viewCatalogue: true,
      viewStatements: false,
      downloadExports: false,
      syncLicensing: false,
      topMarkets: false,
      emailNotifications: false,
      coWriterSplits: false,
      multiCurrency: false,
    },
  },
  special: {
    id: 'special',
    name: 'Special',
    price: 20,
    maxPROs: 3,
    features: {
      viewCatalogue: true,
      viewStatements: true,
      downloadExports: false,
      syncLicensing: true,
      syncLicensingLimit: 3,
      topMarkets: true,
      emailNotifications: true,
      coWriterSplits: true,
      multiCurrency: true,
    },
  },
  royal: {
    id: 'royal',
    name: 'Royal',
    price: 40,
    maxPROs: Infinity,
    features: {
      viewCatalogue: true,
      viewStatements: true,
      downloadExports: true,
      syncLicensing: true,
      syncLicensingLimit: Infinity,
      topMarkets: true,
      emailNotifications: true,
      coWriterSplits: true,
      multiCurrency: true,
    },
  },
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  const [tier, setTier] = useState(() => {
    const saved = localStorage.getItem('rt_tier')
    return saved && TIERS[saved] ? saved : 'free'
  })
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    localStorage.setItem('rt_tier', tier)
  }, [tier])

  const currentTier = TIERS[tier]

  const canAccess = useCallback((feature) => {
    return currentTier.features[feature] ?? false
  }, [currentTier])

  const canAddPRO = useCallback((currentCount) => {
    return currentCount < currentTier.maxPROs
  }, [currentTier])

  const upgradeTo = useCallback((newTier) => {
    if (TIERS[newTier]) {
      setTier(newTier)
      setShowPricing(false)
    }
  }, [])

  return (
    <SubscriptionContext.Provider value={{
      tier,
      currentTier,
      canAccess,
      canAddPRO,
      upgradeTo,
      showPricing,
      setShowPricing,
      TIERS,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
