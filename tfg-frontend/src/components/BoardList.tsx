import { useBoards } from '@/hooks/use-boards.ts'
import { BoardListSkeleton } from '@/components/BoardListSkeleton.tsx'
import { CreateBoardItem } from '@/components/CreateBoardItem.tsx'
import { BoardItem } from '@/components/BoardItem.tsx'

export function BoardList() {
  const { data = [], isLoading } = useBoards()
  return (
    <>
      <h3 className="text-2xl font-semibold">Tus tableros</h3>
      <div className="mt-3 grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          <BoardListSkeleton />
        ) : (
          <>
            {data.map((board) => (
              <BoardItem key={board.id} board={board} />
            ))}
            <CreateBoardItem />
          </>
        )}
      </div>
    </>
  )
}
