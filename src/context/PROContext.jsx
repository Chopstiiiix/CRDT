import { createContext, useContext, useState } from 'react'
import { generateMockData } from '../data/mockData'

const PROContext = createContext(null)

export const PRO_REGISTRY = {
  bmi: {
    id: 'bmi', name: 'BMI', fullName: 'Broadcast Music Inc.',
    colorClass: 'pro-bmi', color: '#4a9eff',
    country: 'USA', website: 'bmi.com',
  },
  ascap: {
    id: 'ascap', name: 'ASCAP', fullName: 'American Society of Composers, Authors & Publishers',
    colorClass: 'pro-ascap', color: '#f87171',
    country: 'USA', website: 'ascap.com',
  },
  prs: {
    id: 'prs', name: 'PRS', fullName: 'PRS for Music',
    colorClass: 'pro-prs', color: '#2dd4bf',
    country: 'UK', website: 'prsformusic.com',
  },
  songtrust: {
    id: 'songtrust', name: 'Songtrust', fullName: 'Songtrust',
    colorClass: 'pro-songtrust', color: '#a78bfa',
    country: 'Global', website: 'songtrust.com',
  },
  sesac: {
    id: 'sesac', name: 'SESAC', fullName: 'SESAC',
    colorClass: 'pro-sesac', color: '#fbbf24',
    country: 'USA', website: 'sesac.com',
  },
  socan: {
    id: 'socan', name: 'SOCAN', fullName: 'Society of Composers, Authors & Music Publishers of Canada',
    colorClass: 'pro-socan', color: '#34d399',
    country: 'Canada', website: 'socan.com',
  },
}

export function PROProvider({ children }) {
  const [connectedPROs, setConnectedPROs] = useState(() => {
    const saved = localStorage.getItem('rt_pros')
    if (saved) return JSON.parse(saved)
    // Demo: pre-load all PROs
    return [
      { ...PRO_REGISTRY.bmi, accountId: 'BMI-00213456', data: generateMockData('bmi') },
      { ...PRO_REGISTRY.ascap, accountId: 'ASCAP-77821', data: generateMockData('ascap') },
      { ...PRO_REGISTRY.prs, accountId: 'PRS-44198320', data: generateMockData('prs') },
      { ...PRO_REGISTRY.songtrust, accountId: 'ST-90127654', data: generateMockData('songtrust') },
      { ...PRO_REGISTRY.sesac, accountId: 'SESAC-33045821', data: generateMockData('sesac') },
      { ...PRO_REGISTRY.socan, accountId: 'SOCAN-11583920', data: generateMockData('socan') },
    ]
  })

  const save = (pros) => {
    setConnectedPROs(pros)
    localStorage.setItem('rt_pros', JSON.stringify(pros))
  }

  const addPRO = (proId, accountId) => {
    const base = PRO_REGISTRY[proId]
    if (!base) return
    if (connectedPROs.find(p => p.id === proId)) return
    const entry = { ...base, accountId, data: generateMockData(proId) }
    save([...connectedPROs, entry])
  }

  const removePRO = (proId) => {
    save(connectedPROs.filter(p => p.id !== proId))
  }

  const getPRO = (proId) => connectedPROs.find(p => p.id === proId)

  return (
    <PROContext.Provider value={{ connectedPROs, addPRO, removePRO, getPRO, PRO_REGISTRY }}>
      {children}
    </PROContext.Provider>
  )
}

export const usePRO = () => useContext(PROContext)
