import { Link, useRouterState } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import { ThemeSwitcher } from '@/components/theme/theme-switcher.tsx'

export function Topbar() {
  const router = useRouterState()

  const isBoardRoute = () => router.location.pathname.includes('board')
  return (
    <>
      <header className="flex w-full justify-between">
        <div className="flex-1">
          <header className="flex gap-3 p-4">
            <Link to="/">Mis tableros</Link>
            {isBoardRoute() && <span>Ajustes del tablero</span>}
          </header>
        </div>
        <div className="flex items-center gap-3 px-3">
          <ThemeSwitcher />
        </div>
      </header>
      <Separator />
    </>
  )
}
