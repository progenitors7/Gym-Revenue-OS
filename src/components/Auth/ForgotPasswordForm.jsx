import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Mail, Loader2, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

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
      <div className="w-full text-center space-y-8 py-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/5 border border-emerald-500/20"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Link Dispatched</h2>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Recovery instructions sent to <br />
            <span className="text-emerald-500 font-bold">{email}</span>
          </p>
        </div>
        <button
          onClick={() => onSwitch('login')}
          className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-[0.2em] transition-all border-b border-emerald-500/20 pb-1"
        >
          Return to Command Center
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onSwitch('login')}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Reset Entry Protocol</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="reset-email" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
            Registered Email
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@gymrevenue.os"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/5 text-white placeholder-slate-700 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
          </div>
        </div>

        <button
          id="reset-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Dispatching...
            </>
          ) : (
            <>
              Send Recovery Link
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
