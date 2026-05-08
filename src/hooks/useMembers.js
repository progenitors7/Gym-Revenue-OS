/**
 * useMembers.js
 * Hook that manages member list state — fetch, optimistic updates, search.
 */
import { useState, useEffect, useCallback } from 'react'
import { getMembers, createMember, updateMember, deleteMember, filterMembers } from '../services/memberService'
import { useCurrentGym } from './useCurrentGym'

export function useMembers() {
  const { gymId, isReady } = useCurrentGym()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchMembers = useCallback(async () => {
    if (!isReady) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getMembers()
      setMembers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isReady])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const addMember = useCallback(async (formData) => {
    if (!gymId) throw new Error('Gym not loaded')
    const payload = { ...formData, gym_id: gymId }
    const newMember = await createMember(payload)
    setMembers((prev) => [newMember, ...prev])
    return newMember
  }, [gymId])

  const editMember = useCallback(async (id, formData) => {
    const updated = await updateMember(id, formData)
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)))
    return updated
  }, [])

  const removeMember = useCallback(async (id) => {
    await deleteMember(id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const filtered = filterMembers(members, searchQuery)

  return {
    members,
    filteredMembers: filtered,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchMembers,
    addMember,
    editMember,
    removeMember,
  }
}
