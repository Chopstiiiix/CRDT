import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PROProvider } from './context/PROContext'
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext'
import Sidebar from './components/Sidebar'
import PricingModal from './components/PricingModal'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PRODashboard from './pages/PRODashboard'
import ConnectPRO from './pages/ConnectPRO'
import Settings from './pages/Settings'
import SyncLicensing from './pages/SyncLicensing'
import AdminDashboard from './pages/AdminDashboard'
import ErrorBoundary from './components/ErrorBoundary'

function ProtectedLayout({ children }) {
  const { user } = useAuth()
  const { showPricing } = useSubscription()
  const [sidebarWidth, setSidebarWidth] = useState(60)
  if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mesh background */}
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      <Sidebar onWidthChange={setSidebarWidth} />

      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        overflowY: 'auto',
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {children}
      </main>

      {showPricing && <PricingModal />}
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/pro/:proId" element={<ProtectedLayout><PRODashboard /></ProtectedLayout>} />
      <Route path="/connect" element={<ProtectedLayout><ConnectPRO /></ProtectedLayout>} />
      <Route path="/sync-licensing" element={<ProtectedLayout><SyncLicensing /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/admin" element={<ProtectedLayout><AdminDashboard /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <PROProvider>
            <AppRoutes />
          </PROProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
