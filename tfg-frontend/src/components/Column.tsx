import { type Column as ColumnType } from '@/api/column-api.ts'
import { DotsIcon } from '@/components/icons/dots-icon.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CreateTaskDialog } from '@/components/CreateTaskDialog.tsx'
import { Task } from '@/components/Task.tsx'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { columnItemClassName } from '@/constants/board.constants.ts'

export function Column({ column }: { column: ColumnType }) {
  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <article
          {...provided.droppableProps}
          className={`${columnItemClassName} rounded bg-secondary p-4`}
          ref={provided.innerRef}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{column.name}</h3>
            <Button variant="ghost">
              <DotsIcon />
            </Button>
          </div>
          <div>
            <CreateTaskDialog boardId={column.boardId} columnId={column.id} />
          </div>
          <ol className="list-none space-y-3">
            {column.tasks?.map((task, index) => (
              <Draggable draggableId={task.id} key={task.id} index={index}>
                {(provided) => (
                  <li
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="cursor-pointer transition hover:scale-105"
                    ref={provided.innerRef}
                  >
                    <Task task={task} />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ol>
        </article>
      )}
    </Droppable>
  )
}
