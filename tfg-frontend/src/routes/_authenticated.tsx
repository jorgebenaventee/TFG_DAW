import { createFileRoute, Outlet } from '@tanstack/react-router'
import { checkAuth } from '@/utils/auth.ts'
import { Topbar } from '@/components/topbar.tsx'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: checkAuth,
  component: Authenticated,
})

function Authenticated() {
  return (
    <>
      <Topbar />
      <main className="h-full w-full">
        <Outlet />
      </main>
    </>
  )
}
