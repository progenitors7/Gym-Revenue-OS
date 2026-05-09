import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function ForgotPasswordForm({ onSwitch }) {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      await resetPasswordForEmail(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Check your email</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          We've sent a password reset link to <span className="text-white font-medium">{email}</span>. 
          Please click the link in the email to reset your password.
        </p>
        <button
          onClick={() => onSwitch('login')}
          className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
        >
          Back to Sign in
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset password</h2>
        <p className="mt-1 text-sm text-slate-400">Enter your email and we'll send you a reset link</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-slate-300 mb-1.5">
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gymname.com"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          id="reset-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending link...
            </span>
          ) : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Remember your password?{' '}
        <button
          onClick={() => onSwitch('login')}
          className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
