import { boardApi } from '@/api/board-api'
import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/board/$boardId/settings')(
  {
    component: Settings,
  },
)

function Settings() {
  const { boardId } = Route.useParams()
  return (
    <main className="flex h-full">
      <aside className="flex h-full min-w-52 justify-center border border-l-secondary-foreground py-3">
        <ul className="mt-8 flex w-full flex-col">
          <Link
            to="/board/$boardId/settings/users"
            params={{ boardId }}
            className="w-full p-4 text-center transition-all duration-75 hover:bg-secondary"
          >
            <strong className="p-4">Usuarios</strong>
          </Link>
          <Link
            to="/board/$boardId/settings/tags"
            params={{ boardId }}
            className="w-full p-4 text-center transition-colors duration-75 hover:bg-secondary"
          >
            <strong className="p-4">Etiquetas</strong>
          </Link>
        </ul>
      </aside>
      <article className="flex-1">
        <Outlet />
      </article>
    </main>
  )
}
