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
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all'

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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {globalError && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {globalError}
        </div>
      )}

      {/* Row 1: Name + Phone */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full Name" required error={errors.full_name}>
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
          <select id="member-gender" value={form.gender} onChange={set('gender')} className={inputCls}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Membership Plan" required error={errors.membership_plan}>
          <select id="member-plan" value={form.membership_plan} onChange={set('membership_plan')} className={inputCls}>
            <option value="">Select plan</option>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      {/* Row 3: Join date + Expiry date */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Join Date" required error={errors.join_date}>
          <input
            id="member-join-date"
            type="date"
            value={form.join_date}
            onChange={set('join_date')}
            className={inputCls}
          />
        </Field>
        <Field label="Expiry Date" required error={errors.expiry_date}>
          <input
            id="member-expiry-date"
            type="date"
            value={form.expiry_date}
            onChange={set('expiry_date')}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          id="member-notes"
          value={form.notes}
          onChange={set('notes')}
          placeholder="Optional notes about this member…"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          id="member-form-submit"
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors min-w-[120px]"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {mode === 'add' ? 'Adding…' : 'Saving…'}
            </span>
          ) : mode === 'add' ? 'Add Member' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
