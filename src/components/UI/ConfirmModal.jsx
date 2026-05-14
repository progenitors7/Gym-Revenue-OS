import { AlertTriangle } from 'lucide-react'

/**
 * ConfirmModal.jsx
 * Generic confirmation dialog used for destructive actions.
 */
export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] w-full max-w-sm p-8 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-[80px]" />
        
        {/* Icon */}
        <div className="relative w-16 h-16 rounded-[1.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/5">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        <h3 className="relative text-white font-black text-center text-xl mb-3 tracking-tight">{title}</h3>
        <p className="relative text-slate-400 text-sm text-center mb-8 leading-relaxed font-medium px-2">{message}</p>

        <div className="relative flex gap-4">
          <button
            id="confirm-modal-cancel"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            id="confirm-modal-confirm"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wait…
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
