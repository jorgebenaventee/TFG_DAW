import { createFileRoute } from '@tanstack/react-router'
import { ColumnsSkeleton } from '@/components/ColumnsSkeleton.tsx'
import { useColumns, useMoveTask } from '@/hooks/use-columns.ts'
import { useToast } from '@/components/ui/use-toast.ts'
import { ToastAction } from '@/components/ui/toast.tsx'
import { Column } from '@/components/Column.tsx'
import { useBoards } from '@/hooks/use-boards.ts'
import { CreateColumnPopover } from '@/components/CreateColumnPopover.tsx'
import { DragDropContext } from '@hello-pangea/dnd'

export const Route = createFileRoute('/_authenticated/board/$boardId')({
  component: Board,
})

function Board() {
  const { boardId } = Route.useParams()
  const { data: boardsData } = useBoards()
  const { data, isError, isLoading, refetch } = useColumns({ boardId })
  const { mutate } = useMoveTask({ boardId })
  const { toast } = useToast()
  if (isError) {
    toast({
      title: 'Algo ha salido mal',
      description: 'No se han podido cargar las columnas',
      action: (
        <ToastAction altText="Reintentar" onClick={() => refetch()}>
          Reintentar
        </ToastAction>
      ),
    })
  }
  let board
  if (boardsData) {
    board = boardsData.find((board) => board.id === boardId)
  }
  return (
    <>
      <div className="mt-3 flex gap-4">
        <h1 className="px-4 py-2 font-bold">{board && board.name}</h1>
        <CreateColumnPopover boardId={boardId} />
      </div>
      <div className="flex h-full flex-nowrap gap-6 p-3">
        {isLoading && <ColumnsSkeleton />}
        <DragDropContext
          onDragEnd={(e) => {
            const { destination, draggableId } = e
            if (!destination) return
            mutate({
              boardId,
              newColumnId: destination.droppableId,
              order: destination.index,
              taskId: draggableId,
            })
          }}
        >
          {data &&
            data.map((column) => <Column key={column.id} column={column} />)}
        </DragDropContext>
      </div>
    </>
  )
}
