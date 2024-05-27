import { createLazyFileRoute } from '@tanstack/react-router'
import { ThemeSwitcher } from '@/components/theme/theme-switcher.tsx'
import { RegisterForm } from '@/components/forms/RegisterForm.tsx'

export const Route = createLazyFileRoute('/register')({
  component: Register,
})

function Register() {
  return (
    <div className="grid min-h-screen grid-cols-2 overflow-hidden">
      <div className="relative h-full">
        <RegisterForm />
        <ThemeSwitcher className="absolute right-5 top-5" />
      </div>
      <div>
        <img
          src="/login-form-photo.webp"
          alt="Imagen del formulario de login"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
