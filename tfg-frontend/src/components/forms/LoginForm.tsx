import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { Button } from '@/components/ui/button.tsx'
import { useLoginForm } from '@/hooks/use-login-form.ts'

export function LoginForm() {
  const { loginForm } = useLoginForm()
  return (
    <div className="grid size-full place-content-center">
      <Card>
        <CardHeader>
          <img
            src="/taskify-logo.webp"
            alt="Logo de Taskify"
            className="m-auto block w-full max-w-72"
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
