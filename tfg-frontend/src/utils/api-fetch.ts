import { z } from 'zod'
import { useAuthStore } from '@/store/auth-store.ts'

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
  return await fetch(`${import.meta.env.VITE_BACK_URL}${endpoint}`, options)
    .then(async (res) => {
      if (res.status === 401) {
        useAuthStore.getState().setToken(null)
        window.location.reload()
      }
      if (options.responseIsJson) {
        const body = await res.json()
        if (!res.ok) throw new Error(JSON.stringify(body))
        if (schema) {
          return schema.parse(body)
        }
        return body
      } else {
        return res
      }
    })
    .catch((e) => {
      console.log('Error in apiFetch')
      console.error(e)
      throw e
    })
}
