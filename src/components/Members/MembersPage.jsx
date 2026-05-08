/**
 * MembersPage.jsx
 * Main members list with search, status filter tabs, table (desktop) + cards (mobile),
 * and quick-access delete confirm modal.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMembers } from '../../hooks/useMembers'
import StatusBadge from '../UI/StatusBadge'
import ConfirmModal from '../UI/ConfirmModal'

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring_soon', label: 'Expiring Soon' },
  { key: 'expired', label: 'Expired' },
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-white font-semibold mb-1">{hasSearch ? 'No members found' : 'No members yet'}</p>
      <p className="text-slate-500 text-sm max-w-xs">
        {hasSearch
          ? 'Try a different name or phone number.'
          : 'Add your first member to get started.'}
      </p>
      {!hasSearch && (
        <Link
          to="/members/new"
          className="mt-5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors"
        >
          + Add Member
        </Link>
      )}
    </div>
  )
}

export default function MembersPage() {
  const navigate = useNavigate()
  const {
    filteredMembers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    removeMember,
  } = useMembers()

  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name }
  const [deleting, setDeleting] = useState(false)

  // Apply status filter on top of search filter
  const displayed = statusFilter === 'all'
    ? filteredMembers
    : filteredMembers.filter((m) => m.status === statusFilter)

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeMember(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  // Counts for tab badges
  const counts = {
    all: filteredMembers.length,
    active: filteredMembers.filter((m) => m.status === 'active').length,
    expiring_soon: filteredMembers.filter((m) => m.status === 'expiring_soon').length,
    expired: filteredMembers.filter((m) => m.status === 'expired').length,
  }

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-6xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Members</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {loading ? 'Loading…' : `${counts.all} member${counts.all !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Link
          id="add-member-btn"
          to="/members/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </Link>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="member-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* ── Status tabs ── */}
      <div className="flex gap-1 mb-6 bg-slate-800/60 rounded-xl p-1 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              statusFilter === tab.key
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.key ? 'bg-slate-600 text-slate-300' : 'bg-slate-700/50 text-slate-500'
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to load members: {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl" />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {!loading && !error && (
        <>
          {displayed.length === 0 ? (
            <EmptyState hasSearch={!!searchQuery} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/50">
                      <th className="text-left px-5 py-3 text-slate-400 font-medium">Member</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Phone</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Plan</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Expiry</th>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                      <th className="text-right px-5 py-3 text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {displayed.map((member) => (
                      <tr key={member.id} className="bg-slate-800/20 hover:bg-slate-800/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold flex-shrink-0 uppercase">
                              {member.full_name?.slice(0, 1)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.full_name}</p>
                              <p className="text-slate-500 text-xs capitalize">{member.gender || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300 font-mono text-xs">{member.phone_number || '—'}</td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-300 text-xs font-medium">
                            {member.membership_plan}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-xs">{formatDate(member.expiry_date)}</td>
                        <td className="px-4 py-4"><StatusBadge status={member.status} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/members/${member.id}/edit`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                              title="Edit member"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: member.id, name: member.full_name })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete member"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {displayed.map((member) => (
                  <div key={member.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold flex-shrink-0 uppercase">
                          {member.full_name?.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{member.full_name}</p>
                          <p className="text-slate-500 text-xs">{member.phone_number || 'No phone'}</p>
                        </div>
                      </div>
                      <StatusBadge status={member.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 text-xs font-medium">
                          {member.membership_plan}
                        </span>
                        <span className="text-slate-500 text-xs">Exp: {formatDate(member.expiry_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/members/${member.id}/edit`)}
                          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: member.id, name: member.full_name })}
                          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-slate-600 text-xs text-center mt-5">
                Showing {displayed.length} of {counts[statusFilter === 'all' ? 'all' : statusFilter]} members
              </p>
            </>
          )}
        </>
      )}

      {/* ── Delete confirm modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Member"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Member"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
