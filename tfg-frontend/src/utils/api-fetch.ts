import { z } from 'zod'
import { useAuthStore } from '@/store/auth-store.ts'
import { redirect } from '@tanstack/react-router'

// Stop typescript from crying
type RequestInit = Parameters<typeof fetch>['1']

/*
 * This function is a wrapper around fetch that adds the token to the headers
 * @param endpoint - The endpoint to fetch
 * @param options - The options to pass to fetch
 * @param schema - The schema to validate the response
 *
 * */
export async function apiFetch<T extends z.ZodTypeAny>(
  endpoint: string,
  options: RequestInit & { responseIsJson?: boolean } = {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  schema?: T,
): Promise<z.infer<T>> {
  const token = useAuthStore.getState().token
  options.responseIsJson ??= true
  options.headers ??= {
    'Content-Type': 'application/json',
  }
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return await fetch(
    `${import.meta.env.VITE_BACK_URL}${endpoint}`,
    options,
  ).then(async (res) => {
    if (res.status === 401) {
      useAuthStore.getState().setToken(null)
      throw redirect({ to: '/login', replace: true, throw: true })
    }
    if (options.responseIsJson) {
      const body = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(body))
      if (schema) {
        const parsed = await schema.parseAsync(body)
        return parsed as Promise<z.infer<T>>
      }
      return body
    } else {
      return res
    }
  })
}
