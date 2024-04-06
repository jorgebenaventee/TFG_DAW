import { type Column as ColumnType } from '@/api/column-api.ts'
import { columnItemClassName } from '@/constants/board.constants.ts'
import { DotsIcon } from '@/components/icons/dots-icon.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CreateTaskDialog } from '@/components/CreateTaskDialog.tsx'
import { Task } from '@/components/Task.tsx'

export function Column({ column }: { column: ColumnType }) {
  return (
    <article className={`${columnItemClassName} rounded bg-secondary p-4`}>
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
        {column.tasks?.map((task) => (
          <li
            key={task.id}
            className="cursor-pointer transition hover:scale-105"
          >
            <Task task={task} />
          </li>
        ))}
      </ol>
    </article>
  )
}
