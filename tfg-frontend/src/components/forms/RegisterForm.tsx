import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { Button } from '@/components/ui/button.tsx'
import { useRegisterForm } from '@/hooks/use-register-form.ts'
import { Link } from '@tanstack/react-router'

export function RegisterForm() {
  const { registerForm } = useRegisterForm()
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
          <registerForm.Provider>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void registerForm.handleSubmit()
              }}
            >
              <registerForm.Field
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
              <registerForm.Field
                name="password"
                validatorAdapter={zodValidator}
                validators={{
                  onSubmit: z
                    .string()
                    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
                    .max(
                      50,
                      'La contraseña no puede tener más de 50 caracteres',
                    ),
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
              <registerForm.Field
                name="confirmPassword"
                validatorAdapter={zodValidator}
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    if (value !== fieldApi.form.getFieldValue('password')) {
                      return 'Las contraseñas no coinciden'
                    }
                    return undefined
                  },
                  onSubmit: z
                    .string()
                    .min(1, 'La confirmación de la contraseña es requerida'),
                }}
                children={(field) => (
                  <Label className="flex flex-col gap-2">
                    Confirmar contraseña
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
              <Button variant="default">Registrarse</Button>
              <Link to="/login">
                <small className="m-0 p-0 text-sm text-gray-500">
                  ¿Ya tienes cuenta? Inicia sesión
                </small>
              </Link>
            </form>
          </registerForm.Provider>
        </CardContent>
      </Card>
    </div>
  )
}
