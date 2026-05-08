import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Gym Revenue OS</span>
          </div>

          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
              Run your gym<br />like a business.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Track revenue, manage members, and grow your gym — all from one powerful dashboard.
            </p>
          </div>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap gap-3">
            {['Revenue Tracking', 'Member Management', 'Attendance Analytics', 'Payment Collection'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { label: 'Gyms using the OS', value: '1,200+' },
            { label: 'Revenue tracked', value: '₹48 Cr+' },
            { label: 'Members managed', value: '2.4L+' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right auth panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 sm:px-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-tight">Gym Revenue OS</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Toggle tabs */}
          <div className="flex rounded-xl bg-slate-800 p-1 mb-8 gap-1">
            <button
              id="tab-login"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign in
            </button>
            <button
              id="tab-signup"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create account
            </button>
          </div>

          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('signup')} />
          ) : (
            <SignupForm onSwitch={() => setMode('login')} />
          )}
        </div>

        <p className="mt-10 text-xs text-slate-600 text-center">
          © 2026 Gym Revenue OS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
