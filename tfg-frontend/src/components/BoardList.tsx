import { useBoards } from '@/hooks/use-boards.ts'
import { BoardListSkeleton } from '@/components/BoardListSkeleton.tsx'
import { CreateBoardItem } from '@/components/CreateBoardItem.tsx'
import { BoardItem } from '@/components/BoardItem.tsx'
import { Link } from '@tanstack/react-router'

export function BoardList() {
  const { data = [], isLoading } = useBoards()
  const isDeleteButtonTarget = (target: EventTarget) => {
    if (target instanceof HTMLDivElement) {
      return false
    }
    if (
      !(target instanceof HTMLButtonElement) ||
      !(target instanceof SVGElement)
    ) {
      return true
    }

    const ancestor = target.closest('[data-delete-button]')
    if (!ancestor) {
      return true
    }

    return false
  }
  return (
    <>
      <h3 className="text-2xl font-semibold">Tus tableros</h3>
      <div className="mt-3 grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          <BoardListSkeleton />
        ) : (
          <>
            {data.map((board) => (
              <Link
                key={board.id}
                to="/board/$boardId"
                params={{ boardId: board.id }}
                onClick={(e) => {
                  const { target } = e
                  if (isDeleteButtonTarget(target)) {
                    e.preventDefault()
                  }
                }}
              >
                <BoardItem board={board} />
              </Link>
            ))}
            <CreateBoardItem />
          </>
        )}
      </div>
    </>
  )
}
