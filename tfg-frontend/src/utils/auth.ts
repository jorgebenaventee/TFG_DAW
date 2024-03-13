import { useAuthStore } from '@/store/auth-store.ts'
import { ParsedLocation, redirect } from '@tanstack/react-router'

export function checkAuth({ location }: { location: ParsedLocation }) {
  const token = useAuthStore.getState().token
  if (!token) {
    const search: Record<string, string> = {}
    if (location.href !== '/') {
      search.redirect = location.href
    }
    throw redirect({
      to: '/login',
      search,
    })
  }
}
