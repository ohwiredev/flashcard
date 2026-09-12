import { create } from 'zustand'
import { apiGet, apiPost, ApiError } from './apiClient'

export interface AuthUser {
  id: string
  email: string
}

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated'
  user: AuthUser | null
  error: string | null
  checkSession: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  user: null,
  error: null,

  checkSession: async () => {
    try {
      const data = await apiGet<{ user: AuthUser }>('/auth/me')
      set({ status: 'authenticated', user: data.user, error: null })
    } catch {
      set({ status: 'unauthenticated', user: null })
    }
  },

  login: async (email, password) => {
    set({ error: null })
    try {
      const data = await apiPost<{ user: AuthUser }>('/auth/login', { email, password })
      set({ status: 'authenticated', user: data.user })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not sign in.'
      set({ error: message })
      throw err
    }
  },

  logout: async () => {
    await apiPost('/auth/logout')
    set({ status: 'unauthenticated', user: null })
  },
}))
