/**
 * AddMemberPage.jsx
 * Route: /members/new
 */
import { useNavigate } from 'react-router-dom'
import { useMembers } from '../../hooks/useMembers'
import MemberForm from './MemberForm'

export default function AddMemberPage() {
  const navigate = useNavigate()
  const { addMember } = useMembers()

  const handleSubmit = async (formData) => {
    await addMember(formData)
    navigate('/members')
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
        <div>
          <h1 className="text-xl font-bold text-white">Add New Member</h1>
          <p className="text-slate-400 text-sm mt-0.5">Fill in the details to register a new gym member</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <MemberForm
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/members')}
        />
      </div>
    </div>
  )
}
