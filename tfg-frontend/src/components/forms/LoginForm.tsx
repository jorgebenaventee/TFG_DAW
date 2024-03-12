import { createFormFactory } from '@tanstack/react-form'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/store/auth-store.ts'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'

const formFactory = createFormFactory({
  defaultValues: {
    username: '',
    password: '',
  },
})

export function LoginForm() {
  const { loginForm } = useLoginForm()
  return (
    <div className="size-full grid place-content-center">
      <Card>
        <CardHeader>
          <img
            src="/taskify-logo.webp"
            alt="Logo de Taskify"
            className="w-full max-w-72 block m-auto"
          />
        </CardHeader>
        <CardContent>
          <loginForm.Provider>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void loginForm.handleSubmit()
              }}
            >
              <loginForm.Field
                validatorAdapter={zodValidator}
                validators={{
                  onSubmit: z
                    .string()
                    .min(1, 'El nombre de usuario es requerido'),
                }}
                name="username"
                children={(field) => (
                  <Label className="flex flex-col gap-2">
                    Nombre de usuario
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <em className="text-red-500" role="alert">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </Label>
                )}
              />
              <loginForm.Field
                name="password"
                validatorAdapter={zodValidator}
                validators={{
                  onSubmit: z.string().min(1, 'La contraseña es requerida'),
                }}
                children={(field) => (
                  <Label className="flex flex-col gap-2">
                    Contraseña
                    <Input
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <em className="text-red-500" role="alert">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </Label>
                )}
              />
              <Button variant="default">Iniciar sesión</Button>
            </form>
          </loginForm.Provider>
        </CardContent>
      </Card>
    </div>
  )
}

function useLoginForm() {
  const { toast } = useToast()
  const { token, setToken } = useAuthStore()
  const navigate = useNavigate()
  if (token) {
    void navigate({ to: '/', replace: true })
  }
  const { mutate } = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      fetch(`${import.meta.env.VITE_BACK_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(JSON.stringify(body))
        const response = z.object({ token: z.string() })
        return response.parseAsync(body)
      }),
    onSuccess: (data) => {
      setToken(data.token)
      void navigate({ to: '/', replace: true })
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
