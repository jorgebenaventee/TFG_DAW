import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { Separator } from './ui/separator'
import { ThemeSwitcher } from '@/components/theme/theme-switcher.tsx'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

export function Topbar() {
  const { boardId } = useParams({ from: '/_authenticated/board/$boardId' })

  const router = useRouterState()

  const isBoardRoute = () => router.location.pathname.includes('board')
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
                  <Link to="/board/$boardId/settings" params={{ boardId }}>
                    <NavigationMenuItem
                      className={navigationMenuTriggerStyle()}
                    >
                      Ajustes del tablero
                    </NavigationMenuItem>
                  </Link>
                )}
              </NavigationMenuList>
            </NavigationMenu>
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
