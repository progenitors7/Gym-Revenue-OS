import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { GymProvider } from './context/GymProvider'
import { NotificationProvider } from './context/NotificationProvider'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'


const AuthPage = React.lazy(() => import('./components/Auth/AuthPage'))
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'))
const MembersPage = React.lazy(() => import('./components/Members/MembersPage'))
const AddMemberPage = React.lazy(() => import('./components/Members/AddMemberPage'))
const EditMemberPage = React.lazy(() => import('./components/Members/EditMemberPage'))
const SubscriptionsPage = React.lazy(() => import('./components/Subscriptions/SubscriptionsPage'))
const AddSubscriptionPage = React.lazy(() => import('./components/Subscriptions/AddSubscriptionPage'))
const PaymentsPage = React.lazy(() => import('./components/Payments/PaymentsPage'))
const AddPaymentPage = React.lazy(() => import('./components/Payments/AddPaymentPage'))
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'))
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))

function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <AppLayout>
          <Suspense fallback={<LoadingScreen />}>
            {children}
          </Suspense>
        </AppLayout>
      </NotificationProvider>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GymProvider>
          <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-900"><LoadingScreen /></div>}>
            <Routes>
              {/* ── Public ── */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ── Protected ── */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/members"          element={<Protected><MembersPage /></Protected>} />
            <Route path="/members/new"      element={<Protected><AddMemberPage /></Protected>} />
            <Route path="/members/:id/edit" element={<Protected><EditMemberPage /></Protected>} />
            
            <Route path="/subscriptions"     element={<Protected><SubscriptionsPage /></Protected>} />
            <Route path="/subscriptions/new" element={<Protected><AddSubscriptionPage /></Protected>} />
            
            <Route path="/payments"          element={<Protected><PaymentsPage /></Protected>} />
            <Route path="/payments/new"      element={<Protected><AddPaymentPage /></Protected>} />

            <Route path="/notifications"     element={<Protected><NotificationsPage /></Protected>} />
            <Route path="/settings"          element={<Protected><SettingsPage /></Protected>} />

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </GymProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
