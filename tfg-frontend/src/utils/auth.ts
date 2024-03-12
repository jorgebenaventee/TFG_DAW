import { useAuthStore } from '@/store/auth-store.ts'
import { ParsedLocation, redirect } from '@tanstack/react-router'

export function checkAuth({ location }: { location: ParsedLocation }) {
  const token = useAuthStore.getState().token
  if (!token) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    })
  }
}
