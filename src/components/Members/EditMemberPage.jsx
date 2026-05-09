/**
 * EditMemberPage.jsx
 * Route: /members/:id/edit
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMemberById } from '../../services/memberService'
import { useMembers } from '../../hooks/useMembers'
import MemberForm from './MemberForm'
import StatusBadge from '../UI/StatusBadge'

export default function EditMemberPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { editMember } = useMembers()

  const [member, setMember] = useState(null)
  const [loadingMember, setLoadingMember] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    let active = true
    getMemberById(id)
      .then((data) => { if (active) setMember(data) })
      .catch((err) => { if (active) setFetchError(err.message) })
      .finally(() => { if (active) setLoadingMember(false) })
    return () => { active = false }
  }, [id])

  const handleSubmit = async (formData) => {
    // Only pass editable fields to the update
    const { full_name, phone_number, membership_plan, expiry_date, notes, gender } = formData
    await editMember(id, { full_name, phone_number, membership_plan, expiry_date, notes, gender })
    navigate('/members')
  }

  if (loadingMember) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (fetchError || !member) {
    return (
      <div className="p-8 text-center">
        <p className="text-white font-semibold mb-2">Member not found</p>
        <p className="text-slate-400 text-sm mb-4">{fetchError}</p>
        <button
          onClick={() => navigate('/members')}
          className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors"
        >
          Back to Members
        </button>
      </div>
    )
  }

  // Map DB fields → form defaults
  const initialValues = {
    full_name: member.full_name ?? '',
    phone_number: member.phone_number ?? '',
    gender: member.gender ?? '',
    membership_plan: member.membership_plan ?? '',
    join_date: member.join_date ?? '',
    expiry_date: member.expiry_date ?? '',
    notes: member.notes ?? '',
  }

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/members')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Back to members"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white truncate">Edit — {member.full_name}</h1>
            <StatusBadge status={member.status} />
          </div>
          <p className="text-slate-400 text-sm mt-0.5">Update member details</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <MemberForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/members')}
        />
      </div>
    </div>
  )
}
