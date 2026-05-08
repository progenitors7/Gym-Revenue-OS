/**
 * memberService.js
 * All Supabase queries for the `members` table.
 * RLS + my_gym_id() ensures every query is scoped to the authenticated owner's gym.
 */
import { supabase } from '../lib/supabaseClient'

const MEMBER_FIELDS = `
  id, gym_id, full_name, phone_number, gender,
  join_date, membership_plan, expiry_date, status, notes, created_at
`

/**
 * Fetch all members for the current user's gym.
 * @returns {Promise<Array>}
 */
export async function getMembers() {
  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_FIELDS)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Fetch a single member by id.
 */
export async function getMemberById(id) {
  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_FIELDS)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new member.
 * gym_id is passed explicitly (from GymContext) — RLS double-checks it.
 */
export async function createMember(payload) {
  const { data, error } = await supabase
    .from('members')
    .insert(payload)
    .select(MEMBER_FIELDS)
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing member by id.
 */
export async function updateMember(id, payload) {
  const { data, error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', id)
    .select(MEMBER_FIELDS)
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a member by id.
 */
export async function deleteMember(id) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Search members by name or phone (client-side filter for instant UX).
 * All results are already RLS-scoped, so this is safe.
 */
export function filterMembers(members, query) {
  if (!query?.trim()) return members
  const q = query.toLowerCase()
  return members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(q) ||
      m.phone_number?.toLowerCase().includes(q)
  )
}
