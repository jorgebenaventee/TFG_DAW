import { Separator } from './ui/separator'
import { ThemeSwitcher } from '@/components/theme/theme-switcher.tsx'

export function Topbar() {
  return (
    <>
      <div className="flex w-full justify-between">
        <div className="flex-1">
          <header className="p-4">Soy un topbar :)</header>
        </div>
        <div className="flex items-center gap-3 px-3">
          <ThemeSwitcher />
        </div>
      </div>
      <Separator />
    </>
  )
}
