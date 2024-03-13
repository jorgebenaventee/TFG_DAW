import { createLazyFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/forms/LoginForm.tsx'
import { ThemeSwitcher } from '@/components/theme/theme-switcher.tsx'

export const Route = createLazyFileRoute('/login')({
  component: Login,
})

function Login() {
  return (
    <div className="grid min-h-screen grid-cols-2 overflow-hidden">
      <div className="relative h-full">
        <LoginForm />
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
