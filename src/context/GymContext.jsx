import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getMyGym, createMyGym, updateGymName as updateGymNameService } from '../services/gymService'

const GymContext = createContext(null)

export function GymProvider({ children }) {
  const [gym, setGym] = useState(null)
  const [gymLoading, setGymLoading] = useState(true)
  const [gymError, setGymError] = useState(null)

  const fetchGym = useCallback(async (user) => {
    if (!user) {
      setGym(null)
      setGymLoading(false)
      return
    }

    setGymLoading(true)
    setGymError(null)

    try {
      let gymData = await getMyGym()

      if (!gymData) {
        const emailPrefix = user.email?.split('@')[0] || 'My'
        try {
          gymData = await createMyGym(`${emailPrefix}'s Gym`)
        } catch (insertErr) {
          if (insertErr.code === '23505') {
            gymData = await getMyGym()
          } else {
            throw insertErr
          }
        }
      }

      setGym(gymData)
    } catch (err) {
      if (err.status === 401 || err.code === 'PGRST301') {
        console.warn('[GymContext] Stale session — signing out.')
        await supabase.auth.signOut()
        setGym(null)
      } else {
        console.error('[GymContext] Error fetching gym:', err.message)
        setGymError(err.message)
        setGym(null)
      }
    } finally {
      setGymLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const safetyTimer = setTimeout(() => {
        if (isMounted) setGymLoading(false)
      }, 6000)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) await fetchGym(session?.user ?? null)
      } catch {
        if (isMounted) setGymLoading(false)
      } finally {
        clearTimeout(safetyTimer)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (isMounted) await fetchGym(session?.user ?? null)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchGym])

  const refreshGym = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await fetchGym(user)
  }, [fetchGym])

  const updateGymName = useCallback(async (newName) => {
    const updated = await updateGymNameService(newName)
    setGym(updated)
    return updated
  }, [])

  const value = { gym, gymLoading, gymError, refreshGym, updateGymName }

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>
}

export function useGym() {
  const context = useContext(GymContext)
  if (!context) throw new Error('useGym must be used within a GymProvider')
  return context
}
