/**
 * useCurrentGym.js
 * Convenience hook returning gym state with derived helpers.
 * Import this in components instead of useGym() directly.
 */
import { useGym } from './useGym'
import { useAuth } from './useAuth'


export function useCurrentGym() {
  const { gym, gymLoading, gymError, refreshGym, updateGymName } = useGym()
  const { user } = useAuth()

  return {
    gym,
    gymLoading,
    gymError,
    refreshGym,
    updateGymName,
    /** True when both auth and gym are resolved */
    isReady: !gymLoading && !!gym,
    /** Gym id — safe shorthand */
    gymId: gym?.id ?? null,
    /** Gym name — safe shorthand */
    gymName: gym?.gym_name ?? null,
    /** Owner email from auth */
    ownerEmail: user?.email ?? null,
  }
}
