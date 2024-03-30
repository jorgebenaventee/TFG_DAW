import { type Column as ColumnType } from '@/api/column-api.ts'
import { columnItemClassName } from '@/constants/board.constants.ts'
import { DotsIcon } from '@/components/icons/dots-icon.tsx'
import { Button } from '@/components/ui/button.tsx'
import { PlusIcon } from '@/components/icons/plus-icon.tsx'

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
        <Button variant="ghost" className="flex w-full justify-start gap-2 p-0">
          <PlusIcon className="size-5" />
          Añadir tarea
        </Button>
      </div>
    </article>
  )
}
