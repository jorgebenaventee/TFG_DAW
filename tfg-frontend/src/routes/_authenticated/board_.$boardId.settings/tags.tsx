import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/board/$boardId/settings/tags')({
  component: () => <div>Hello /_authenticated/board/$boardId/settings/tags!</div>
})