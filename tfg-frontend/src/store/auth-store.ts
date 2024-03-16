import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type AuthStore = {
  token: string | null
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        setToken: (token: string | null) => set({ token }),
      }),
      {
        name: 'auth-storage',
      },
    ),
  ),
)
