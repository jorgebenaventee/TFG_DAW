import { createLazyFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/forms/LoginForm.tsx'
import { ThemeSwitcher } from '@/components/theme/theme-switcher.tsx'

export const Route = createLazyFileRoute('/login')({
  component: Login,
})

function Login() {
  return (
    <div className="grid grid-cols-2 min-h-screen overflow-hidden">
      <div className="h-full">
        <div className="p-3 flex justify-end mr-10">
          <ThemeSwitcher className="inline" />
        </div>
        <LoginForm />
      </div>
      <div>
        <img
          src="/8970fda24f3e1a8d763ae54c04d04ecb.webp"
          // src="public/login-form-photo.webp"
          alt="Imagen del formulario de login"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
