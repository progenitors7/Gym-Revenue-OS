/**
 * MemberForm.jsx
 * Reusable form for creating and editing members.
 * Props:
 *  - initialValues: object (defaults for edit mode)
 *  - onSubmit: async (formData) => void
 *  - onCancel: () => void
 *  - mode: 'add' | 'edit'
 */
import { useState } from 'react'
import { User, Phone, Activity, Award, Calendar, FileText } from 'lucide-react'
import DatePicker from '../UI/DatePicker'

const PLANS = ['Monthly', 'Quarterly', '6 Months', 'Annual', 'Day Pass', 'Custom']

const DEFAULTS = {
  full_name: '',
  phone_number: '',
  gender: '',
  membership_plan: '',
  join_date: new Date().toISOString().split('T')[0],
  expiry_date: '',
  notes: '',
}

function Field({ label, required, children, error }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group">
        {children}
      </div>
      {error && <p className="mt-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider ml-1">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full pl-12 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all'

export default function MemberForm({ initialValues = {}, onSubmit, onCancel, mode = 'add' }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...initialValues })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.membership_plan) errs.membership_plan = 'Plan is required'
    if (!form.expiry_date) errs.expiry_date = 'Expiry date is required'
    if (!form.join_date) errs.join_date = 'Join date is required'
    if (form.phone_number && !/^[0-9+\-\s()]{7,15}$/.test(form.phone_number)) {
      errs.phone_number = 'Enter a valid phone number'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setGlobalError(null)
    setSubmitting(true)
    try {
      // Strip empty strings → null for optional fields
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
      )
      await onSubmit(payload)
    } catch (err) {
      setGlobalError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {globalError && (
        <div className="px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider animate-shake">
          {globalError}
        </div>
      )}

      {/* Row 1: Name + Phone */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full Name" required error={errors.full_name}>
          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          <input
            id="member-full-name"
            type="text"
            value={form.full_name}
            onChange={set('full_name')}
            placeholder="e.g. Rahul Sharma"
            className={inputCls}
          />
        </Field>
        <Field label="Phone Number" error={errors.phone_number}>
          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          <input
            id="member-phone"
            type="tel"
            value={form.phone_number}
            onChange={set('phone_number')}
            placeholder="e.g. 9876543210"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Row 2: Gender + Plan */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Gender">
          <Activity className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          <select id="member-gender" value={form.gender} onChange={set('gender')} className={inputCls}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Membership Plan" required error={errors.membership_plan}>
          <Award className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          <select id="member-plan" value={form.membership_plan} onChange={set('membership_plan')} className={inputCls}>
            <option value="">Select plan</option>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      {/* Row 3: Join date + Expiry date */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Join Date" required error={errors.join_date}>
          <DatePicker
            value={form.join_date}
            onChange={(val) => setForm(f => ({ ...f, join_date: val }))}
          />
        </Field>
        <Field label="Expiry Date" required error={errors.expiry_date}>
          <DatePicker
            value={form.expiry_date}
            onChange={(val) => setForm(f => ({ ...f, expiry_date: val }))}
          />
        </Field>
      </div>

      {/* Notes */}
      <Field label="Notes">
        <FileText className="absolute left-5 top-5 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
        <textarea
          id="member-notes"
          value={form.notes}
          onChange={set('notes')}
          placeholder="Optional notes about this member…"
          rows={3}
          className={`${inputCls} resize-none pt-4`}
        />
      </Field>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="order-2 sm:order-1 px-8 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all border border-white/5 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          id="member-form-submit"
          type="submit"
          disabled={submitting}
          className="order-1 sm:order-2 group relative px-10 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {mode === 'add' ? 'Processing…' : 'Syncing…'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {mode === 'add' ? 'Initialize Athlete' : 'Commit Changes'}
            </span>
          )}
        </button>
      </div>
    </form>
  )
}
