/**
 * gymService.js
 * All Supabase queries related to the `gyms` table.
 * RLS ensures every query is automatically scoped to auth.uid().
 */
import { supabase } from '../lib/supabaseClient'

/**
 * Fetch the gym belonging to the currently authenticated user.
 * Returns null if none exists yet.
 */
export async function getMyGym(userId) {
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('gyms')
    .select('id, gym_name, owner_user_id, created_at')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('DEBUG: getMyGym error:', error)
    throw error
  }
  
  return data
}

/**
 * Create a gym for the current user.
 * The DB trigger handles this on signup, but this is the manual fallback
 * for edge cases (e.g. trigger race condition, email-unconfirmed users).
 */
export async function createMyGym(gymName, userId) {
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('gyms')
    .insert({ gym_name: gymName, owner_user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update the authenticated user's gym name.
 */
export async function updateGymName(newName) {
  const { data, error } = await supabase
    .from('gyms')
    .update({ gym_name: newName })
    .eq('owner_user_id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single()

  if (error) throw error
  return data
}
