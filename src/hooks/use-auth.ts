import { useStore } from '@tanstack/react-store'
import { authStore } from '@/stores'

export function useAuth() {
  const user = useStore(authStore, (state) => state.user)
  const session = useStore(authStore, (state) => state.session)
  const loading = useStore(authStore, (state) => state.loading)
  const initialized = useStore(authStore, (state) => state.initialized)

  return {
    user,
    session,
    loading,
    initialized,
    isAuthenticated: !!user,
  }
}
