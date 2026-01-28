import { Store } from '@tanstack/store'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export const authStore = new Store<AuthState>({
  user: null,
  session: null,
  loading: true,
  initialized: false,
})

// Initialize auth state
export async function initAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    authStore.setState((state) => ({
      ...state,
      user: session?.user ?? null,
      session: session ?? null,
      loading: false,
      initialized: true,
    }))

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      authStore.setState((state) => ({
        ...state,
        user: session?.user ?? null,
        session: session ?? null,
      }))
    })
  } catch (error) {
    console.error('Failed to initialize auth:', error)
    authStore.setState((state) => ({
      ...state,
      loading: false,
      initialized: true,
    }))
  }
}

// Auth actions
export async function signInWithEmail(email: string, password: string) {
  authStore.setState((state) => ({ ...state, loading: true }))

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  authStore.setState((state) => ({ ...state, loading: false }))

  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  authStore.setState((state) => ({ ...state, loading: true }))

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  authStore.setState((state) => ({ ...state, loading: false }))

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
