import { createFormFactory } from '@tanstack/react-form'
import { useToast } from '@/components/ui/use-toast.ts'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/utils/api-fetch.ts'
import { z } from 'zod'
import { useAuthStore } from '@/store/auth-store.ts'

const formFactory = createFormFactory({
  defaultValues: {
    username: '',
    password: '',
    confirmPassword: '',
  },
})

export function useRegisterForm() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { setToken } = useAuthStore()
  const { mutate } = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiFetch(
        '/auth/register',
        {
          body: JSON.stringify(data),
          method: 'POST',
        },
        z.object({ token: z.string() }),
      ),
    onSuccess: async (data) => {
      setToken(data.token)
      await navigate({ to: '/' })
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
  const registerForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate(value)
    },
  })
  return { registerForm }
}
