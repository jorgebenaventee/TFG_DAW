import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/board/$boardId/settings')(
  {
    component: Settings,
  },
)

function Settings() {
  const { boardId } = Route.useParams()
  return <h1>Hola ajustes {boardId}</h1>
}

