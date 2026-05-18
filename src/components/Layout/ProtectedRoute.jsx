import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCurrentGym } from '../../hooks/useCurrentGym'

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { gym, gymLoading } = useCurrentGym()
  const location = useLocation()

  if (authLoading || gymLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#3390ec] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Verifying Access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  // Subscription Paywall: Redirect to billing if gym is pending or expired.
  // Allow access to /billing, /settings, and /super-admin
  const isBillingPage = location.pathname === '/billing'
  const isSettingsPage = location.pathname === '/settings'
  const isSuperAdmin = location.pathname.startsWith('/super-admin')
  const requiresBilling = gym?.status === 'pending' || gym?.billing_status === 'expired'
  
  if (requiresBilling && !isBillingPage && !isSettingsPage && !isSuperAdmin) {
    return <Navigate to="/billing" replace />
  }

  return children
}
