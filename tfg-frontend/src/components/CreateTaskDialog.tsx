import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { PlusIcon } from '@/components/icons/plus-icon.tsx'
import { CreateTaskForm } from '@/components/CreateTaskForm.tsx'

export function CreateTaskDialog({
  boardId,
  columnId,
}: {
  boardId: string
  columnId: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-start gap-2 p-0">
          <PlusIcon className="size-5" />
          Añadir tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[1200px]">
        <DialogHeader className="text-2xl font-bold">Añadir tarea</DialogHeader>
        <CreateTaskForm boardId={boardId} columnId={columnId} />
      </DialogContent>
    </Dialog>
  )
}
