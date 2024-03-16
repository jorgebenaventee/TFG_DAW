import { BoardList } from '@/components/BoardList'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/')({
  component: Index,
})

function Index() {
  return (
    <div className="m-3 p-2">
      <BoardList />
    </div>
  )
}
