import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/auth-store'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createFormFactory } from '@tanstack/react-form'
import { apiFetch } from '@/utils/api-fetch.ts'
import { z } from 'zod'

const formFactory = createFormFactory({
  defaultValues: {
    username: '',
    password: '',
  },
})

export function useLoginForm() {
  const { toast } = useToast()
  const { token, setToken } = useAuthStore()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(window.location.search)
  const redirect = queryParams.get('redirect') ?? '/'
  if (token) {
    void navigate({ to: redirect, replace: true })
  }
  const { mutate } = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiFetch(
        '/auth/login',
        {
          body: JSON.stringify(data),
          method: 'POST',
        },
        z.object({ token: z.string() }),
      ),
    onSuccess: (data) => {
      setToken(data.token)
      void navigate({ to: redirect, replace: true })
    },
    onError: (error) => {
      const errorResponse = JSON.parse(error.message)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorResponse.message,
      })
    },
  })
  const loginForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate(value)
    },
  })
  return {
    loginForm,
  }
}
