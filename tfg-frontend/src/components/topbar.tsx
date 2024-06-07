import {
  Link,
  useNavigate,
  useParams,
  useRouterState,
} from '@tanstack/react-router'
import { Separator } from './ui/separator'
import { ThemeSwitcher } from '@/components/theme/theme-switcher.tsx'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/store/auth-store.ts'
import { useBoard } from '@/hooks/use-board.ts'

export function Topbar() {
  const { boardId } = useParams({ from: '/_authenticated/board/$boardId' })
  const authStore = useAuthStore()

  const router = useRouterState()
  const navigate = useNavigate()

  const closeSession = () => {
    authStore.setToken(null)
    void navigate({ to: '/login' })
  }
  const { data: board } = useBoard({ boardId })

  const isBoardRoute = () =>
    board?.isAdmin && router.location.pathname.includes('board')
  const isSettingsRoute = () =>
    board?.isAdmin &&
    router.location.pathname.includes('board') &&
    router.location.pathname.includes('board') &&
    router.location.pathname.includes('settings')
  return (
    <>
      <header className="flex w-full justify-between">
        <div className="flex-1">
          <header className="flex gap-3 p-4">
            <NavigationMenu>
              <NavigationMenuList>
                <Link to="/">
                  <NavigationMenuItem className={navigationMenuTriggerStyle()}>
                    Mis tableros
                  </NavigationMenuItem>
                </Link>
                {isBoardRoute() && (
                  <>
                    <Link to="/board/$boardId/settings" params={{ boardId }}>
                      <NavigationMenuItem
                        className={navigationMenuTriggerStyle()}
                      >
                        Ajustes del tablero
                      </NavigationMenuItem>
                    </Link>
                  </>
                )}
                {isSettingsRoute() && (
                  <>
                    <Link to="/board/$boardId" params={{ boardId }}>
                      <NavigationMenuItem
                        className={navigationMenuTriggerStyle()}
                      >
                        Volver al tablero
                      </NavigationMenuItem>
                    </Link>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </header>
        </div>
        <div className="flex items-center gap-3 px-3">
          <Button
            variant="ghost"
            className="text-red-500"
            onClick={closeSession}
          >
            Cerrar sesión
          </Button>
          <ThemeSwitcher />
        </div>
      </header>
      <Separator />
    </>
  )
}
